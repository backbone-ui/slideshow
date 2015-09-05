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
		define(['jquery', 'underscore', 'backbone'], lib);
	} else if ( typeof module === "object" && module && typeof module.exports === "object" ){
		// Expose as module.exports in loaders that implement CommonJS module pattern.
		module.exports = lib;
	} else {
		// Browser globals
		lib(window.jQuery, window._, window.Backbone);
	}

}(function ($, _, Backbone) {

	// global scope
	window = window || this.window || {};
	// support for Backbone APP() view if available...
	var isAPP = ( typeof APP !== "undefined" );
	var View = ( isAPP && typeof APP.View !== "undefined" ) ? APP.View : Backbone.View;

	// main view
	var Slideshow = View.extend({

		el: ".ui-slideshow",

		// default options
		options: {
			slideClass: ".slide",
			navEl: ".nav",
			width : "100%",
			height: "100%",
			num: 0,
			slides: 0,
			autoplay: false,
			autoloop: false,
			transition: true,
			timeout: 2000,
			_direction: "right"
		},

		events : {
			"click .prev" : "clickPrev",
			"click .next" : "clickNext",
			"click .nav a" : "clickBullet",
			"webkitTransitionEnd " : "_transitionEnd"
		},

		timer: false,

		initialize: function(){
			var self = this;
			window.addEventListener('resize', function(){ self.position() }, false);
			//

			return View.prototype.initialize.apply(this, arguments );
		},

		// default render - may be overriden if postRender is included
		render: function(){
			if(isAPP) {
				return View.prototype.render.call(this);
			} else {
				this.preRender();
				this.postRender();
			}
		},

		preRender: function(){
			// #1 find the slide number based on either the data or the markup
			this.options.slides = ( this.collection ) ? this.collection.length : $(this.el).find( this.options.slideClass ).length;
		},

		postRender: function(){
			var self = this;
			// add plugin classes
			$(this.el).addClass("ui-slideshow");
			$(this.el).find( this.options.slideClass ).addClass("ui-slideshow-slide");
			// render slide dimensions as a number
			this.options.width = this._getSize(this.options.width, $(this.el).width() );
			this.options.height = this._getSize(this.options.height, $(this.el).height() );
			// stop now if we only have one slide
			if( this.options.slides == 1 ) return;
			// slight delay to let the DOM rest
			setTimeout(function(){
				self.position();
				// set the first media element as active
				self.activate( 0 );
			}, 100);
		},

		clickPrev : function( e ){
			e.preventDefault();
			var prev = $(this.el).find( this.options.slideClass +".active").prev().index();
			if( prev > -1 ) this.activate( prev );
		},

		clickNext : function( e ){
			e.preventDefault();
			var next = $(this.el).find( this.options.slideClass +".active").next().index();
			if( next > -1 ) this.activate( next );
		},

		clickBullet : function( e ){
			e.preventDefault();
			var num = $(e.target).closest("li").index();
			this.activate( num );
		},

		position : function(){

			var $wrapper = $(this.el).find(".wrapper:first"),
				elWidth = $(this.el).width(),
				elHeight = $(this.el).height();

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
				//$wrapper.removeClass("transition").css({ marginLeft : -1 * this.options.num * this.options.width }).delay("100").addClass("transition");
				$wrapper.removeClass("transition").css(
					{
						'-webkit-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'-o-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'-ms-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'-moz-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)'
					}
				).delay("100").addClass("transition");
			} else {
				//$wrapper.css({ marginLeft : -1 * this.options.num * this.options.width });
				$wrapper.css(
					{
						'-webkit-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'-o-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'-ms-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'-moz-transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)',
						'transform': 'translate('+ -1 * this.options.num * this.options.width +'px,0)'
					}
				);
			}
		},

		activate : function( num ){
			// variables
			var self = this;
			var $wrapper = $(this.el).find(".wrapper:first");
			// prerequisite
			if( _.isUndefined( $wrapper ) ) return;
			// set direction
			this.options._direction = ( this.options.num - num > 0 )? "left" : "right";
			// if looping make sure there's always a slide on the sides
			if( this.options.autoloop ){
				var $first = $(this.el).find( this.options.slideClass +":first");
				var $last = $(this.el).find( this.options.slideClass +":last");
				if( num == 0 ){
					$last.remove();
					$wrapper.prepend($last);
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					//$wrapper.css({ marginLeft : -1 * (num+1) * this.options.width });
					$wrapper.css('-webkit-transform', 'translate3d('+ -1 * (num+1) * this.options.width +'px,0,0)');
					num++;
				} else if( num == this.options.slides-1 || (( num * this.options.width) > this.options.overflow ) ){
					$first.remove();
					$wrapper.append($first);
					num--;
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					//
					//$wrapper.css({ marginLeft : -1 * (num-1) * this.options.width });
					$wrapper.css(
						{
							'-webkit-transform': 'translate('+ -1 * (num-1) * this.options.width +'px,0)',
							'-o-transform': 'translate('+ -1 * (num-1) * this.options.width +'px,0)',
							'-ms-transform': 'translate('+ -1 * (num-1) * this.options.width +'px,0)',
							'-moz-transform': 'translate('+ -1 * (num-1) * this.options.width +'px,0)',
							'transform': 'translate('+ -1 * (num-1) * this.options.width +'px,0)'
						}
					);
				}
			}
			// set the active classes
			$(this.el).find( this.options.slideClass +":eq("+ num +")").addClass("active").siblings().removeClass("active");
			$(this.el).find( this.options.navEl +" li:eq("+ num +")").addClass("selected").siblings().removeClass("selected");

			// position the wrapper
			// limit the container to the right side
			var wrapperPos = Math.min( ( num * this.options.width), this.options.overflow);
			$wrapper.delay(100).queue(function(){
				// re-enable transitions
				if( self.options.transition ) $(this).addClass("transition");
				//$(this).css({ marginLeft : -1 * wrapperPos });
				$(this).css(
					{
						'-webkit-transform': 'translate('+ -1 * wrapperPos +'px,0)',
						'-o-transform': 'translate('+ -1 * wrapperPos +'px,0)',
						'-ms-transform': 'translate('+ -1 * wrapperPos +'px,0)',
						'-moz-transform': 'translate('+ -1 * wrapperPos +'px,0)',
						'transform': 'translate('+ -1 * wrapperPos +'px,0)'
					}
				)

				$(this).dequeue();
			});

			// update the prev-next arrows - remove as needed
			if( this.options.autoloop || this.options.overflow <= 0 ){
				// hide arrows
				$(this.el).find(".prev").hide();
				$(this.el).find(".next").hide();
			} else if( num == 0 ){
				$(this.el).find(".prev").hide();
				$(this.el).find(".next").show();
			} else if( (num == this.options.slides-1) || (wrapperPos && wrapperPos == this.options.overflow) ){
				$(this.el).find(".prev").show();
				$(this.el).find(".next").hide();
			} else {
				$(this.el).find(".prev").show();
				$(this.el).find(".next").show();
			}
			// auto play next slide
			if( this.options.autoplay && ( num < this.options.slides-1 || ( this.options.slides == 2 && num <= this.options.slides-1 )) ){
				if( this.timer ) clearTimeout( this.timer );
				this.timer = setTimeout(function(){
					//
					self.activate( self.options.num+1 );
				}, this.options.timeout);
			}
			// save current slide
			this.options.num = num;

		},

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
