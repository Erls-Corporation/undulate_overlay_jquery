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
	var totalStaticks = 0;

	// constructor
	var Statick = function(elem, options){
		try{
			this.statickPaper = null;
			this.version = '0.1';
			this.drawing = false;
			jQuery.extend(this, options);
		
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
			this.paper = Raphael(this.canvas, elem.width, elem.height);
			calculateNumDrawObjects.call(this);
			_createItems.call(this);
			this.startDrawing();
		}
		catch(e){
			debug_console( e.message, "error");
		}
	};

	function _createItems(){
    // console.log("_createItems");
    var i, j, circle;
    this.circles = [];

    for ( j = 0; j < this.numCols; j++){
      this.circles[j] = [];
      for ( i = 0; i < this.numRows; i++){
        circle = this.paper.circle( (j*this.x_offset), (i*this.y_offset), this.circleSize );
        if ( this.stroke ){
          circle.attr("stroke", this.stroke);
        }
        this.circles[j][i] = circle;
      }
    }
  };

	function _drawItems(){  // draw function
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

	function calculateNumDrawObjects(){
		this.numCols = this.width / this.circleSize;
		this.numRows = this.height / this.circleSize;
		this.x_offset = this.circleSize * 2; // circle's radius times 2, so they don't overlap
		this.y_offset = this.circleSize * 2;
	};

	function getTotalStaticks(){
		return totalStaticks;
	};

	// draw at a fixed rate
	function _fixedDrawing(){
		var self = this,
			drawFn = this.drawFunction;

		drawFn.apply(self);

		self.drawIntervalHandle = setInterval(function(){
				drawFn.apply(self);
			},
			this.timing.baseTime
		);
	};

	function destroy(fade){
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

	$.fn.statick = function(options) {
		try{
			// Create some defaults, extending them with any options that were provided
			var defaults = {
				title : "untitled statick",
				circleSize : 20,
				opacity: 0.5,
				createFunction: _createItems,
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

