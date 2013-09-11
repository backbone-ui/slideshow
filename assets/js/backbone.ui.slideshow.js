// Backbone.js Slideshow extension
//
// Created by: Makis Tracend (@tracend)
// Source: https://github.com/backbone-ui/slideshow
//
// Licensed under the MIT license:
// http://makesites.org/licenses/MIT

(function($, _, Backbone) {

	// fallbacks
	if( _.isUndefined( Backbone.UI ) ) Backbone.UI = {};
	// support for Backbone APP() view if available...
	var View = ( typeof APP !== "undefined" ) ? APP.View : Backbone.View;

	Backbone.UI.Slideshow = View.extend({
		// default options
		options: {
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
			"click .nav a" : "clickBullet"
		},

		timer: false,

		initialize: function(){
			var self = this;
			window.addEventListener('resize', function(){ self.position() }, false);
			//
			// #1 find the slide number based on either the data or the markup
			this.options.slides = ( this.collection ) ? this.collection.length : $(this.el).find(".slide").length;

			return View.prototype.initialize.apply(this, arguments );
		},

		// default render - may be overriden if postRender is included
		render: function(){
			this.postRender();
		},

		postRender: function(){
			// render slide dimensions as a number
			this.options.width = (this.options.width == "100%") ? $(this.el).width() : this.options.width;
			this.options.height = (this.options.height) ? $(this.el).height() : this.options.height;
			//
			this.position();
			// set the first media element as active
			this.activate( 0 );
		},

		clickPrev : function( e ){
			e.preventDefault();
			var prev = $(this.el).find(".slide.active").prev().index();
			if( prev > -1 ) this.activate( prev );
		},

		clickNext : function( e ){
			e.preventDefault();
			var next = $(this.el).find(".slide.active").next().index();
			if( next > -1 ) this.activate( next );
		},

		clickBullet : function( e ){
			e.preventDefault();
			var num = $(e.target).closest("li").index();
			this.activate( num );
		},

		position : function(){

			$(this.el).find(".slide").css({
				width : this.options.width,
				height : this.options.height
			});
			// update values...
			this.options.width = $(this.el).find(".slide:first").width();
			this.options.height = $(this.el).find(".slide:first").height();

			var wrapperWidth = this.options.width * this.options.slides;
			$(this.el).find(".wrapper").css({
				width : wrapperWidth,
				height : this.options.height
			});

			// position the wrapper
			this.options.overflow = wrapperWidth - $(this.el).width();

			if (this.options.transition) {
				$(this.el).find(".wrapper").removeClass("transition").css({ marginLeft : -1 * this.options.num * this.options.width }).delay("100").addClass("transition");
			} else {
				$(this.el).find(".wrapper").css({ marginLeft : -1 * this.options.num * this.options.width });
			}
		},

		activate : function( num ){
			var self = this;
			// set direction
			this.options._direction = ( this.options.num - num > 0 )? "left" : "right";
			// if looping make sure there's always a slide on the sides
			if( this.options.autoloop ){
				var $first = $(this.el).find(".slide:first");
				var $last = $(this.el).find(".slide:last");
				var $wrapper = $(this.el).find(".wrapper");
				if( num == 0 ){
					$last.remove();
					$wrapper.prepend($last);
					num++;
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					$wrapper.css({ marginLeft : -1 * (num+1) * this.options.width });
				} else if( num == this.options.slides-1 || (( num * this.options.width) > this.options.overflow ) ){
					$first.remove();
					$wrapper.append($first);
					num--;
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					//
					$wrapper.css({ marginLeft : -1 * (num-1) * this.options.width });
				}
				// re-enable transitions
				if( this.options.transition ) $wrapper.addClass("transition");
			}
			// set the active classes
			$(this.el).find(".slide:eq("+ num +")").addClass("active").siblings().removeClass("active");
			$(this.el).find(".nav li:eq("+ num +")").addClass("selected").siblings().removeClass("selected");

			// position the wrapper
			// limit the container to the right side
			var wrapperPos = Math.min( ( num * this.options.width), this.options.overflow);
			$(this.el).find(".wrapper").css({ marginLeft : -1 * wrapperPos });

			// update the prev-next arrows - remove as needed
			if( this.options.autoloop ){
				// do nothing
			} else if( num == 0 ){
				$(this.el).find(".prev").hide();
				$(this.el).find(".next").show();
			} else if( num == this.options.slides-1 ){
				$(this.el).find(".prev").show();
				$(this.el).find(".next").hide();
			} else {
				$(this.el).find(".prev").show();
				$(this.el).find(".next").show();
			}
			// auto play next slide
			if( this.options.autoplay && num < this.options.slides-1 ){
				if( this.timer ) clearTimeout( this.timer );
				this.timer = setTimeout(function(){
					//
					self.activate( self.options.num+1 );
				}, this.options.timeout);
			}
			// save current slide
			this.options.num = num;


		}

	});

	// Support module loaders
	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
		// Expose as module.exports in loaders that implement CommonJS module pattern.
		module.exports = Backbone.UI.Slideshow;
	} else {
		// Register as a named AMD module, used in Require.js
		if ( typeof define === "function" && define.amd ) {
			define( "backbone.ui.slideshow", [], function () { return Backbone.UI.Slideshow; } );
		}
	}
	// If there is a window object, that at least has a document property
	if ( typeof window === "object" && typeof window.document === "object" ) {
		window.Backbone = Backbone;
	}

})(this.jQuery, this._, this.Backbone);