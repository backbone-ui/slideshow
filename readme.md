# Backbone UI: Slider

A simple slideshow feature using existing Backbone structures and CSS3 for lightweight rendering. 


## Install

Using bower: 
```
bower install backbone.ui.slider
```

## Dependencies

* [Backbone](http://backbonejs.org/)
* [Underscore](http://underscorejs.org/)
* [jQuery](http://jquery.com/) (or alternative event handler)

Note that the slider is using APP.View from [Backbone APP](http://github.com/makesites/backbone-app) but is automatically injected if not already available. 


## Usage

In its most simple application, a model with the slides and an html fragment (either the markup or a url of the file containing it) should be enough to render the slider. 

```
var view = new Backbone.UI.Slider({
		el : "#slider", 
		collection : new Backbone.Collection(slides),
		url : "../html/slider.html"
});
view.render();
```
By default the html fragment will be parsed by the underscore's micro-template engine.  You are free to use any template engine by using the ```template``` option as described below. 


## Options

A more detailed list of all the available options. 

* ***collection***: the data for the slides
* ***url***: the url of an html fragment
* ***html***: the markup of the html fragment
* ***template***: A template method to parse the html fragment


### Examples: 

* [Fullscreen Slideshow](http://rawgithub.com/backbone-ui/slider/master/_examples/fullscreen.html)


## Credits

Created by Makis Tracend ( [@tracend](http://github.com/tracend) )

Distributed through [Makesites.org](http://makesites.org/)

Released under the [MIT license](http://makesites.org/licenses/MIT)

