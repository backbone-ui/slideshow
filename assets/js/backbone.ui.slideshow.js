// Backbone.js Slideshow extension
//
// Created by: Makis Tracend (@tracend)
// Source: https://github.com/backbone-ui/slideshow
//
// Licensed under the MIT license:
// http://makesites.org/licenses/MIT

(function(_, Backbone) {

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

		postRender: function(){
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
			/*
			this.options.width = $(this.el).width();
			this.options.height = $(this.el).height();
			*/

			$(this.el).find(".slide").css({
				width : this.options.width,
				height : this.options.height
			});
			// register width as a number
			this._slideWidth = $(this.el).find(".slide:first").width();

			$(this.el).find(".wrapper").css({
				width : this._slideWidth * this.options.slides,
				height : this.options.height
			});

			// position the wrapper

			if (this.options.transition) {
				$(this.el).find(".wrapper").removeClass("transition").css({ marginLeft : -1 * this.options.num * this._slideWidth }).delay("800").addClass("transition");
			} else {
				$(this.el).find(".wrapper").css({ marginLeft : -1 * this.options.num * this._slideWidth });
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
					$wrapper.css({ marginLeft : -1 * (num+1) * this._slideWidth });
					console.log( $wrapper.css("marginLeft") );
				} else if( num == this.options.slides-1 ){
					$first.remove();
					$wrapper.append($first);
					num--;
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					$wrapper.css({ marginLeft : -1 * (num-1) * this._slideWidth });
					console.log( $wrapper.css("marginLeft") );
				}
				// re-enable transitions
				if( this.options.transition ) $wrapper.addClass("transition");
			}
			// set the active classes
			$(this.el).find(".slide:eq("+ num +")").addClass("active").siblings().removeClass("active");
			$(this.el).find(".nav li:eq("+ num +")").addClass("selected").siblings().removeClass("selected");

			// position the wrapper
			$(this.el).find(".wrapper").css({ marginLeft : -1 * num * this._slideWidth });

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

})(this._, this.Backbone);