// Backbone.js Slider extension
//
// Created by: Makis Tracend (@tracend)
// Source: https://github.com/backbone-ui/slider
//
// Licensed under the MIT license: 
// http://makesites.org/licenses/MIT

(function(_, Backbone) {
	
	// fallbacks
	if( _.isUndefined( Backbone.UI ) ) Backbone.UI = {};
	// include the Backbone APP() view if not available...
	// source: https://github.com/makesites/backbone-app/blob/master/lib/app.view.js
	var View = ( typeof APP !== "undefined" ) 
							? APP.View 
							: Backbone.View.extend({options:{data:false,template:false,url:false,type:false},state:{loaded:false},events:{"click a[rel='external']":"clickExternal"},initialize:function(e){var t=this;$(this.el).unbind();_.bindAll(this,"render","clickExternal","postRender");this.data=this.model||this.collection||null;this.options.data=!_.isNull(this.data);if(this.options.attr){$(this.el).attr("data-view",this.options.attr)}else{$(this.el).removeAttr("data-view")}var n=this.options.html||null;var r=this.options.template||typeof APP=="undefined"?this.options.template:APP.Template||false;if(r){if(_.isUndefined(this.options.type))this.options.type="default";this.template=new r(n,{url:this.options.url});this.template.bind("loaded",this.render)}else if(this.options.url){$.get(this.options.url,function(e){t.template=_.template(e);t.render()})}else{this.template=_.template(n);this.render()}if(this.options.data){this.data.bind("change",this.render);this.data.bind("reset",this.render);this.data.bind("add",this.render);this.data.bind("remove",this.render)}if(!this.options.data||this.options.data&&!_.isEmpty(this.data.toJSON())){this.render()}},render:function(){if(!this.template)return;if(!_.isUndefined(this.preRender))this.preRender();var e=this.options.type?this.template.get(this.options.type):this.template;var t=this.options.data?this.data.toJSON():{};var n=e instanceof Function?e(t):e;if(this.options.append){$(this.el).append(n)}else{$(this.el).html(n)}if(!_.isUndefined(this.postRender))this.postRender()},postRender:function(){$(this.el).show();if(!this.options.data||this.options.data&&!_.isEmpty(this.data.toJSON())){$(this.el).removeClass("loading");this.state.loaded=true;this.trigger("loaded")}},listen:function(e,t,n){var r=typeof t=="string"?[t]:t;for(var i in r){e.bind(r[i],n)}},clickExternal:function(e){e.preventDefault();var t=this.findLink(e.target);if(typeof pageTracker!="undefined")t=pageTracker._getLinkerUrl(t);try{window.plugins.childBrowser.showWebPage(t)}catch(n){window.open(t,"_blank")}return false},findLink:function(e){if(e.tagName!="A"){return $(e).closest("a").attr("href")}else{return $(e).attr("href")}},_navigate:function(e){}});
	
			
	Backbone.UI.Slider = View.extend({
		// default options
		options: {
			width : 0,
			height: 0
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
			
		}, 
		
		activate : function( num ){
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