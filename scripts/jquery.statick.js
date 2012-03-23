/*!
 * statick
 *   http://www.telecommutetojuryduty.com/statick
 *
 * Copyright (c) 2011 D.Guzzo (http://www.telecommutetojuryduty.com/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Built on top of the jQuery library
 *   http://jquery.com
 *
 */


(function($){
	var totalStaticks = 0,
		version = '0.1';

	// constructor
	var Statick = function(elem, options){
		try{
			this.version = version; // version of the plugin
			this.drawing = false; // is the canvas currently animating?
			jQuery.extend(this, options); // bestow the object with defaults + any other custom fields/values
		
			///// instance methods -- these can be rolled into the above .extend call if i want
			this.stopDrawing = function(){
				this.drawing = false;
				clearInterval(this.drawIntervalHandle);
			};
		
			this.startDrawing = function(){
				this.drawing = true;
				_fixedDrawing.call(this);
			};
		
			this.toggleDrawing = function(){
				if(this.drawing){this.stopDrawing();}
				else{this.startDrawing();}
			}
			
			this.getTotalStaticks = function(){
				return totalStaticks;
			};
			////////
		
			if ( totalStaticks === 5 ){ // && this.restrictInstances
				debug_console( "warning: too many canvases may slow or even crash your browser! set restrictInstances: true to override this limit", "warn");	
				return;
			}
			
			debug_console( 'init\'ing statick for image: ' + (elem.src || elem.alt));
			totalStaticks += 1;
			jQuery(elem).wrap("<div class='relative'>");

			if ( elem.width === 0 || elem.height === 0 ){
				throw new Error('image has no height or width!');
			}

			this.width = elem.width;
			this.height = elem.height;
			this.canvas = jQuery('<div class="statickContainer">').css({ 
				width: elem.width,
				height: elem.height,
				opacity: options.opacity || 1.0,
			})[0];

			jQuery(elem).after(this.canvas);
			// create the Raphael object
			this.paper = Raphael(this.canvas, elem.width, elem.height);
			// create the drawing items
			options.customCreateItems ? options.customCreateItems.call(this) : _createItems.call(this);	
			
			this.startDrawing();
		}
		catch(e){
			debug_console( e.message, "error");
		}
	};

	// default createItems function
	function _createItems(){
    // console.log("_createItems");
		var circleSize = 20;
		
		// figure out the number of objects to draw on the canvas to fit the image based upon their dimensions and the image's dimensions
		this.numCols = this.width / circleSize;
		this.numRows = this.height / circleSize;
		this.x_offset = circleSize * 2; // circle's radius times 2, so they don't overlap
		this.y_offset = circleSize * 2;
		
    var i, j, circle;
    this.circles = [];

    for ( j = 0; j < this.numCols; j++){
      this.circles[j] = [];
      for ( i = 0; i < this.numRows; i++){
        circle = this.paper.circle( (j*this.x_offset), (i*this.y_offset), circleSize );
        if ( this.stroke ){
          circle.attr("stroke", this.stroke);
        }
        this.circles[j][i] = circle;
      }
    }
  };

	// draw or modify the items created by Raphael on the canvas
	function _drawItems(){
		// debug_console( '_drawItems', "debug");
		var i, j, red, green;

    for ( j = 0; j < this.numCols; j++){
			for ( i = 0; i < this.numRows; i++){
				red = Math.floor(Math.random()*256);
				green = 128 + Math.floor(Math.random()*128);
				blue = 255;
				this.circles[j][i].attr("fill", "rgb("+ red +","+green+","+blue+")");	
			}
    }
	};


	// draw at a fixed rate
	function _fixedDrawing(){
		var $statickObject = this,
			drawFn = $statickObject.drawFunction;

		drawFn.call($statickObject);

		$statickObject.drawIntervalHandle = setInterval(function(){
				drawFn.call($statickObject);
			},
			$statickObject.timing.baseTime
		);
	};

	function _destroy(fade){
		debug_console( 'destroying statick action...', "debug");
		// todo remember to remove .data of the instance attached to the DOM elem...
		///
		///
		
		clearInterval(this.drawIntervalHandle); // stop the draw interval	
		var image = jQuery(this.canvas).siblings('img'); // preserve the original image
		// remove the added canvas div and positioning div
		if ( fade ){
			jQuery(this.canvas).fadeOut( 700, function(){
				jQuery(this).remove(); 
				image.unwrap();
			});
		}
		else{
			jQuery(this.canvas).remove();
			image.unwrap();
		}
	};

	// the only public method for the Statick plugin
	$.fn.statick = function(options) {
		try{
			// Create some defaults, extending them with any options that were provided
			var defaults = {
				title : "untitled statick",
				opacity: 0.5,
				drawFunction: _drawItems,
				restrictInstances: true,
				timing : {
					baseTime : 200
				}
			};

			if( typeof Raphael === "undefined" ){ 
				throw new Error('The Raphael vector library must be included for Statick to work!');
			}

			if (options) {
				$.extend(defaults, options);
			}

			this.each( function(){
				// attach the Statick object instance to the DOM element
				jQuery(this).data('statick', new Statick(this, defaults ));
			});

			return this;
		}
		catch(e){
			debug_console( e.message, "error");
		}
	};

})(jQuery);

