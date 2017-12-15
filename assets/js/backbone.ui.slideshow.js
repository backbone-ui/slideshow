/*
 * Backbone UI: Slideshow
 * Source: https://github.com/backbone-ui/slideshow
 * Copyright © Makesites.org
 *
 * Initiated by Makis Tracend (@tracend)
 * Distributed through [Makesites.org](http://makesites.org)
 * Released under the [MIT license](http://makesites.org/licenses/MIT)
 */

(function (lib) {

	//"use strict";

	// Support module loaders
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('backbone.ui.slideshow', ['jquery', 'underscore', 'backbone'], lib);
	} else if ( typeof module === "object" && module && typeof module.exports === "object" ){
		// Expose as module.exports in loaders that implement CommonJS module pattern.
		module.exports = lib;
	} else {
		// Browser globals
		lib(window.jQuery, window._, window.Backbone);
	}

}(function ($, _, Backbone) {

	// support for Backbone APP() view if available...
	var APP = window.APP || null;
	var isAPP = ( APP !== null && typeof APP == 'function' ); // dirty lookup to make sure APP is a contructor
	var View = ( isAPP && typeof APP.View !== "undefined" ) ? APP.View : Backbone.View;

	// FIX: Backbone doesn't set an options attribute?
	if( !View.prototype.options ) View.prototype.options = {};
	// containers
	var state = View.prototype.state || new Backbone.Model();
	// defaults
	state.set({
		pressing : false,
		current: false,
		direction: false
	});

	// Shims
	// parent inheritance from Backbone.APP
	var parent=function(a,b){a=a||"",b=b||{},this.__inherit=this.__inherit||[];var c=this.__inherit[a]||this._parent||{},d=c.prototype||this.__proto__.constructor.__super__,e=d[a]||function(){delete this.__inherit[a]},f=b instanceof Array?b:[b];return this.__inherit[a]=d._parent||function(){},e.apply(this,f)};

	Backbone.extend=Backbone.extend||function(){var a=Array.prototype.slice.call(arguments,0);if(a.length){var b=a.shift();for(var c in a){var d=a[c],e=b,f=d.prototype?d.prototype:d;if("object"==typeof f){var g=_.extend({},f);delete g._parent,g._parent=e,b=e.extend(g)}}return b}};


	// special case(s) for input views
	if( typeof Backbone.Input !== "undefined" && Backbone.Input.Touch ) View = Backbone.extend( Backbone.Input.Touch, View );
	if( typeof Backbone.Input !== "undefined" && Backbone.Input.Mouse ) View = Backbone.extend( Backbone.Input.Mouse, View );

	// main view
	var Slideshow = View.extend({

		el: ".ui-slideshow",

		// default options
		options: {
			direction: false, // used by autoloop
			slideClass: ".slide",
			navEl: ".nav",
			width : "100%",
			height: "100%",
			html: null,
			slides: 0,
			autoplay: false,
			autoloop: false,
			transition: true,
			draggable: false,
			dragspeed: 1,
			monitor: View.prototype.options.monitor || [],
			timeout: 2000,
			legacyStyles: false
		},

		events : _.extend({}, View.prototype.events, {
			"click .prev" : "clickPrev",
			"click .next" : "clickNext",
			"click .nav a" : "clickBullet",
			"webkitTransitionEnd " : "_transitionEnd"
		}),

		timer: false,

		state: state,

		initialize: function( options ){
			// fallbacks
			options = options || {};
			// variables
			var self = this;
			// independent state container
			this.state = new Backbone.Model({
				pressing : false,
				current: false,
				direction: false
			});
			// defaults //this.state || state; // why?
			_.bindAll(this, 'position');
			this.options = _.extend({}, this.options, options);
			$(window).on('resize.slideshow', self.position);
			// check draggable
			if( this.options.draggable ) this.setupDraggable();
			return this.parent('initialize', options);
		},

		// default render - may be overriden if postRender is included
		render: function(){
			if(isAPP) {
				return this.parent('render');
			} else {
				this.preRender();
				this.postRender();
			}
		},

		preRender: function(){
			// #1 find the slide number based on either the data or the markup
			if ( this.collection ){
				this.options.slides = this.collection.length;
			} else if( this.options.html ){
				this.options.slides = $(this.options.html).filter( this.options.slideClass ).length;
				// create an empty collection with equal set of slides
				if( this.options.slides ) {
					this.options.data = true;
					this.data = this.collection = new Backbone.Collection( new Array( this.options.slides ) );
				}
			} else {
				this.options.slides = $(this.el).find( this.options.slideClass ).length;
				// create an empty collection with equal set of slides
				if( this.options.slides ) {
					this.options.data = true;
					this.data = this.collection = new Backbone.Collection( new Array( this.options.slides ) );
				}
			}
		},

		postRender: function(){
			var self = this;
			// add plugin classes
			$(this.el).addClass("ui-slideshow");
			$(this.el).find( this.options.slideClass ).addClass("ui-slideshow-slide");
			// validate the number of slides (with what's rendered)
			if(  $(this.el).find( this.options.slideClass ).length !== this.options.slides ) this.options.slides = $(this.el).find( this.options.slideClass ).length;
			// render slide dimensions as a number
			this.options.width = this._getSize(this.options.width, $(this.el).width() );
			this.options.height = this._getSize(this.options.height, $(this.el).height() );
			// stop now if we only have one slide
			if( this.options.slides == 1 ) return;
			// add data attributes for slide num
			$(this.el).find( this.options.slideClass ).each(function(i){
				var slide = i+1; // start counting from 1...
				$(this).attr('data-slide', slide);
			});
			// slight delay to let the DOM rest
			setTimeout(function(){
				self.position();
				// set the first media element as active
				self.activate( 1 );
				self.state.set('loaded', true);
			}, 100);
			// include legacy styles
			if( this.options.legacyStyles ){
				$(this.el).find(".arrow").addClass("lbs");
			}
		},

		clickPrev: function( e ){
			e.preventDefault();
			var current = this.state.get('current') || 1;
			var end = ( this.options.autoloop ) ? this.options.slides : 1; // consider direction?
			//var prev = $(this.el).find( this.options.slideClass +".active").prev().index();
			var prev = ( current-1 > 0) ? current-1 : end;
			// set direction
			this.state.set('direction', "left"); // variable based on orientation...
			// animate
			this.activate( prev );
		},

		clickNext: function( e ){
			e.preventDefault();
			var current = this.state.get('current') || 1;
			var end = ( this.options.autoloop ) ? 1 : this.options.slides; // consider direction?
			//var next = $(this.el).find( this.options.slideClass +".active").next().index();
			var next = ( current+1 <= this.options.slides ) ? current+1 : end;
			// set direction
			this.state.set('direction', "right"); // variable based on orientation...
			// animate
			this.activate( next );
		},

		clickBullet: function( e ){
			e.preventDefault();
			var num = $(e.target).closest("li").index()+1;
			var current = this.state.get('current') || 1;
			// set direction
			var direction = false;
			if( current - num > 0 ) direction = "left";
			if( current - num < 0 ) direction = "right";
			this.state.set('direction', direction); // variable based on orientation...
			this.activate( num ); // index starts from zero...
		},

		position: function(){

			var $wrapper = $(this.el).find(".wrapper:first"),
				elWidth = $(this.el).width(),
				elHeight = $(this.el).height(),
				index = this.state.get('index');

			// update slide dimensions...
			if( this.options.width !== "100%") this.options.width = elWidth;
			if( this.options.height !== "100%") this.options.height = elHeight;

			$(this.el).find( this.options.slideClass ).css({
				width : this.options.width,
				height : this.options.height
			});
			// wrapper can't be smaller than the el width
			var wrapperWidth = Math.max( this.options.width * this.options.slides, elWidth );
			$wrapper.css({
				width : wrapperWidth,
				height : this.options.height
			});

			// position the wrapper
			this.options.overflow = wrapperWidth - elWidth;

			if (this.options.transition) {
				//$wrapper.removeClass("transition").css({ marginLeft : -1 * index * this.options.width }).delay("100").addClass("transition");
				$wrapper.removeClass("transition").css(
					{
						'-webkit-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'-o-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'-ms-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'-moz-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)'
					}
				).delay("100").addClass("transition");
			} else {
				//$wrapper.css({ marginLeft : -1 * index * this.options.width });
				$wrapper.css(
					{
						'-webkit-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'-o-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'-ms-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'-moz-transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)',
						'transform': 'translate3d('+ -1 * index * this.options.width +'px,0,0)'
					}
				);
			}
		},

		disable: function(){
			// variables
			var $el = $(this.el);
			// remove events
			$el.unbind();
			$(window).off('resize.slideshow', self.position);
			// remove classes
			$el.removeClass("ui-slideshow");
			$el.find(".slide").removeClass("ui-slideshow-slide");
			// remove inline styles
			// FIX: remove styles on next click (to avoid momentary event triggers)
			setTimeout(function(){
				$el.find(".wrapper").attr("style", " ");
				$el.find(".slide").attr("style", " ");
				$el.find(".wrapper").removeAttr("style");
				$el.find(".slide").removeAttr("style");
			}, 100);
		},

		setupDraggable: function(){
			// prerequisite
			if( typeof Backbone.Input == "undefined" || typeof Backbone.Input.Mouse == "undefined" ) return console.log("Backbone.Input.Mouse is a required dependency for this plugin");
			// update options
			this.options.monitor.push("mouse");
			this._dragImage_Stop();
			this.options.mouse = {
				states: ["down", "move", "up"]
			};

		},

		// Events
		mousedown: function(){
			this._dragImage_Start();
		},

		mousemove: function( e ){
			if( this.state.get('pressing') ) this._dragImage( e );
		},

		mouseup: function(){
			this._dragImage_Stop();
		},

		touchstart: function(){
			this._dragImage_Start();
		},

		touchmove: function( e ){
			if( this.state.get('pressing') ) this._dragImage( e );
		},

		touchend: function(){
			this._dragImage_Stop();
		},

		activate: function( num, auto ){
			// fallback(s)
			if( _.isUndefined(auto) ) auto = false;
			// variables
			var self = this;
			var $wrapper = $(this.el).find(".wrapper:first"),
				current = this.state.get('current') || 1, // the actual slide number
				direction = this.state.get('direction');

			// prerequisite
			if( _.isUndefined( $wrapper ) ) return;

			// elements
			var $nextEl = $(this.el).find( this.options.slideClass +"[data-slide='"+ num +"']");
			var $curEl = $(this.el).find( this.options.slideClass +"[data-slide='"+ current +"']");
			var goto = $nextEl.index();
			var index = $curEl.index();

			// override with default direction if autoplaying
			if( this.options.autoplay && auto ){
				if( this.options.direction ) direction = this.options.direction;
				if( direction == "left" && goto != index-1 ){
					// move next content before
					$curEl.before( $nextEl );
				} else if( direction == "right" &&  goto != index+1 ){
					// move next content before
					$curEl.after( $nextEl );
				}
				// update indexes (after re-ordering)
				index = $curEl.index();
				goto = $nextEl.index();
			}

			// if looping make sure there's always a slide on the sides
			if( this.options.autoloop ){

				//var $first = $(this.el).find( this.options.slideClass +":first");
				//var $last = $(this.el).find( this.options.slideClass +":last");
				//
				// FIX: next loops
				//if( direction == "left" && current == 1 ) num = this.options.slides;
				//if( direction == "right" && current == this.options.slides ) num = 1;
				// update next properties uafter loop updates...
				//$nextEl = $(this.el).find( this.options.slideClass +"[data-slide='"+ num +"']");
				//goto = $nextEl.index();
				// re-order content (if necessary)
				if( direction == "left" && index == 1 ){
					// move content to the front
					//$last.remove();
					//$wrapper.prepend($last);
					$nextEl.remove();
					$wrapper.prepend($nextEl);
					//num = this.options.slides;
				} else if( direction == "right" && index == this.options.slides ){
					// move content to the back
					//$first.remove();
					//$wrapper.append($first);
					$nextEl.remove();
					$wrapper.append($nextEl);
					//num = 1;
				}
				// update indexes (after re-ordering)
				//$nextEl = $(this.el).find( this.options.slideClass +"[data-slide='"+ num +"']");
				//$curEl = $(this.el).find( this.options.slideClass +"[data-slide='"+ current +"']");
				index = $curEl.index();
				goto = $nextEl.index();
				// fix num under certain circumstances
				/*
				if( num == 0 ){
					num++;
					// FIX: autoloop initial state
					slide = ( !this.state.get('loaded') ) ? num: num+1;
				}
				else if( num == this.options.slides-1 || (( num * this.options.width) > this.options.overflow ) ){
					num--;
					// next slide
					slide = num-1;
				}
				*/
			}
			// offset the viewport
			if( this.options.transition ) $wrapper.removeClass("transition");
			// initiate animation
			// - initial position
			var initialPos = ( typeof this._drag_distance == "number" ) ? this._drag_distance : -1 * index * this.options.width;
			//if( typeof this._drag_distance == "number" ) initialPos += (( direction == 'right') ? 1 : -1) + this._drag_distance;
			$wrapper.css(
				{
					'-webkit-transform': 'translate3d('+ initialPos +'px,0,0)',
					'-o-transform': 'translate3d('+ initialPos +'px,0,0)',
					'-ms-transform': 'translate3d('+ initialPos +'px,0,0)',
					'-moz-transform': 'translate3d('+ initialPos +'px,0,0)',
					'transform': 'translate3d('+ initialPos +'px,0,0)'
				}
			);
			// position the wrapper
			// limit the container to the right side
			var wrapperPos = Math.min( ( goto * this.options.width), this.options.overflow);
			$wrapper.delay(100).queue(function(){
				// re-enable transitions
				if( self.options.transition ) $(this).addClass("transition");
				//$(this).css({ marginLeft : -1 * wrapperPos });
				$(this).css(
					{
						'-webkit-transform': 'translate3d('+ -1 * wrapperPos +'px,0,0)',
						'-o-transform': 'translate3d('+ -1 * wrapperPos +'px,0,0)',
						'-ms-transform': 'translate3d('+ -1 * wrapperPos +'px,0,0)',
						'-moz-transform': 'translate3d('+ -1 * wrapperPos +'px,0,0)',
						'transform': 'translate3d('+ -1 * wrapperPos +'px,0,0)'
					}
				);

				$(this).dequeue();
			});
			// set the active classes
			num = $nextEl.data('slide');
			//$(this.el).find( this.options.slideClass +"[data-slide='"+ (num+1) +"']").addClass("active").siblings().removeClass("active");
			$nextEl.addClass("active").siblings().removeClass("active");
			//current = $(this.el).find( this.options.slideClass +".active" ).attr('data-slide');
			$(this.el).find( this.options.navEl +" li:eq("+ (num-1) +")").addClass("selected").siblings().removeClass("selected");

			// update the prev-next arrows - remove as needed
			if( this.options.autoplay || this.options.overflow <= 0 ){
				// hide arrows
				$(this.el).find(".prev").removeClass("active");
				$(this.el).find(".next").removeClass("active");
			} else if( num <= 1 ){
				$(this.el).find(".prev").removeClass("active");
				$(this.el).find(".next").addClass("active");
			} else if( (num >= this.options.slides) || (wrapperPos && wrapperPos == this.options.overflow) ){
				$(this.el).find(".prev").addClass("active");
				$(this.el).find(".next").removeClass("active");
			} else {
				$(this.el).find(".prev").addClass("active");
				$(this.el).find(".next").addClass("active");
			}
			// auto play next slide
			if( this.options.autoplay && this.options.slides > 1 ){
				if( this.timer ) clearTimeout( this.timer );
				this.timer = setTimeout(function(){
					// Stop now if
					// - we stoped autoplay in the meantime
					if( !self.options.autoplay ) return;
					// - we are pressing (dragging) the slides
					if( self.state.get('pressing') ) return;
					// TODO: calculate next based on direction...
					var next = ( num+1 <= self.options.slides ) ? num+1 : 1; // reset
					self.activate( next, true );
				}, this.options.timeout);
			}
			// save current slide
			this.state.set('current', num);
			// broadcast event
			this.trigger("slide", {num: num});
		},

		// Helpers

		// call methods from the parent
		parent: View.prototype.parent || parent,

		// Internal

		_getSize: function(value, max){
			// if a number just return the value
			if( !isNaN( value ) ) return value;
			//
			try{
				// if in pixels return the numberic value
				if( value.substr(-2) == "px") return parseInt( value );
				// if a percentage, calculate it using the max
				if( value.substr(-1) == "%") return max * ( value.substr(0, value.length-1)/ 100);
			} catch( e ){
				//console.log( e );
				// if NaN...
				return 0;
			}
		},

		_transitionEnd: function(){
			// internal logic
			//...
			// user logic
			this.transitionEnd();
		},

		transitionEnd: function(){

		},

		_dragImage_Start: function(){
			// variables
			var $wrapper = $(this.el).find(".wrapper");
			var el = $wrapper[0];
			var st = window.getComputedStyle(el, null);
			var tr = st.getPropertyValue("-webkit-transform") ||
			st.getPropertyValue("-moz-transform") ||
			st.getPropertyValue("-ms-transform") ||
			st.getPropertyValue("-o-transform") ||
			st.getPropertyValue("transform") ||
			"FAIL";
			// exit now if we can't read current transform
			if( tr == "FAIL" ) return;
			// tr: matrix(0, 0, 0, 0, 0px, 0px)
			var pos = parseInt( tr.split(",")[4] );
			if( pos == NaN ) return;
			// set state
			this.state.set('pressing', true); // set by mouse plugin?
			$wrapper.removeClass("transition");

			this._drag_distance = pos;
		},

		_dragImage: function( e ){
			// touch movement; method from backbone.input.touch - fallback if not included...
			var distance = (this._touchDistance) ? this._touchDistance() : e.movementX;
			var $wrapper = $(this.el).find(".wrapper");
			var index = this.state.get('current');

			this._drag_distance = (distance * this.options.dragspeed) - ((index-1) * this.options.width);

			// limit distance to edges
			this._drag_distance = Math.min(this._drag_distance, 0);
			this._drag_distance = Math.max(this._drag_distance, -1 * ($wrapper.width()-this.options.width) );
			//
			$wrapper.css(
				{
					'-webkit-transform': 'translate3d('+ this._drag_distance +'px,0,0)',
					'-o-transform': 'translate3d('+  this._drag_distance +'px,0,0)',
					'-ms-transform': 'translate3d('+  this._drag_distance +'px,0,0)',
					'-moz-transform': 'translate3d('+  this._drag_distance +'px,0,0)',
					'transform': 'translate3d('+ this._drag_distance +'px,0,0)'
				}
			);
		},

		_dragImage_Stop: function(){
			// prerequisites
			if( typeof this._drag_distance == "undefined" ) return;
			// update state
			this.state.set('pressing', false);
			// update slide num
			var pos = Math.abs(this._drag_distance) / this.options.width;
			var fn;
			switch( this.state.get('direction') ){
				case "left":
					fn = Math.ceil;
				break;
				case "right":
					fn = Math.floor;
				break;
				default:
					fn = Math.round;
				break;
			}
			var num = fn( pos ) +1;
			var index = (  this._drag_distance > this.options.width * num ) ? num+1 : num-1;
			// save index
			this.state.set('current', index);
			// re-enable transition
			if( this.options.transition ) $(this.el).find(".wrapper").addClass("transition");
			// move to the closest slide
			this.activate( num );
		}

	});

	// update Backbone namespace regardless
	Backbone.UI = Backbone.UI ||{};
	Backbone.UI.Slideshow = Slideshow;

	// If there is a window object, that at least has a document property
	if ( typeof window === "object" && typeof window.document === "object" ) {
		// update APP namespace
		if( isAPP ){
			APP.UI = APP.UI || {};
			APP.UI.Slideshow = Backbone.UI.Slideshow;
			window.APP = APP;
		}
		window.Backbone = Backbone;
	}

	// for module loaders:
	return Slideshow;


}));
