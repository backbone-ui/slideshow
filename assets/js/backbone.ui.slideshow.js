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
			width : 0,
			height: 0,
			num: 0,
			transition: true
		}, 
		
		initialize: function(){
			var self = this;
			window.addEventListener('resize', function(){ self.position() }, false);
			//
			return View.prototype.initialize.apply(this, arguments );
		},
		 
		events : _.extend({}, View.prototype.events, {
			"click .prev" : "clickPrev",
			"click .next" : "clickNext",
			"click .nav a" : "clickBullet"
		}), 
		
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
			
			this.options.width = $(this.el).width();
			this.options.height = $(this.el).height();
			
			$(this.el).find(".wrapper").css({ 
				width : this.options.width * this.data.length, 
				height : this.options.height
			});
			
			$(this.el).find(".slide").css({ 
				width : this.options.width, 
				height : this.options.height
			});
			
			// position the wrapper
			
			if (this.options.transition) {
				$(this.el).find(".wrapper").removeClass("transition").css({ marginLeft : -1 * this.options.num * this.options.width }).delay("800").addClass("transition");
			} else {
				$(this.el).find(".wrapper").css({ marginLeft : -1 * this.options.num * this.options.width });
			}
		}, 
		
		activate : function( num ){
			//
			this.options.num = num;
			// set the active classes
			$(this.el).find(".slide:eq("+ num +")").addClass("active").siblings().removeClass("active");
			$(this.el).find(".nav li:eq("+ num +")").addClass("selected").siblings().removeClass("selected");
			
			// position the wrapper
			$(this.el).find(".wrapper").css({ marginLeft : -1 * num * this.options.width });
			
			// update the prev-next arrows - remove as needed
			if( num == 0 ){
				$(this.el).find(".prev").hide();
				$(this.el).find(".next").show();
			} else if( num ==  this.data.length-1 ){
				$(this.el).find(".prev").show();
				$(this.el).find(".next").hide();
			} else {
				$(this.el).find(".prev").show();
				$(this.el).find(".next").show();
			}
		}
		
	});

})(this._, this.Backbone);