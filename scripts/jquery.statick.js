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


(function(){

	// Create some defaults, extending them with any options that were provided
  var defaults = {
		title : "untitled statick",
		circleSize : 20,
		opacity: 0.5,
		createFunction: createItems,
		drawFunction: drawItems,
		restrictInstances: true,
		timing : {
			baseTime : 200
		}
  };

	function createItems(){
    // console.log("createItems");
    var i, j, circle;
    this.circles = [];

    for( j = 0; j < this.options.numCols; j++){
      this.circles[j] = [];
      for( i = 0; i < this.options.numRows; i++){
        circle = this.paper.circle( (j*this.options.x_offset), (i*this.options.y_offset), this.options.circleSize );
        if( this.options.stroke ){
          circle.attr("stroke", this.options.stroke);
        }
        this.circles[j][i] = circle;
      }
    }
  };

	function drawItems(){  // draw function
		// debug_console( 'drawItems', "debug");
		
		var i, j, red, green;

    for( j = 0; j < this.options.numCols; j++){
      for( i = 0; i < this.options.numRows; i++){
          red = Math.floor(Math.random()*256);
          green = 128 + Math.floor(Math.random()*128);
          blue = 255;
          this.circles[j][i].attr("fill", "rgb("+ red +","+green+","+blue+")");	
      }
    }
	};

	var totalItems = 0;

	jQuery.statick = function(elem, options){
		this.options = $.extend({}, defaults, options || {});
		this.target = elem;
		this.canvas = null;
		this._init();
		jQuery(this.canvas).data('statick', this); // store state data on the canvas element
	};

	jQuery.statick.prototype.extend = jQuery.extend;
	
	// give each statick object some extra methods, defined outside the constructor
	jQuery.statick.prototype.extend({

		_init : function(){

			try{
				if( this.options.restrictInstances && totalItems === 5 ){
					debug_console( "warning: too many canvases may slow or even crash your browser! set restrictInstances: true to override this limit", "warn");	
					return;
				}

				// debug_console( 'init\'ing statick for item# ' + totalItems);
				debug_console( 'init\'ing statick for image: ' + this.target.src);
				totalItems += 1;

				jQuery(this.target).wrap("<div class='relative'>");

				this.canvas = jQuery('<div class="statickContainer">').css({ 
					width: this.target.width,
					height: this.target.height,
					opacity: this.options.opacity,
					// 'webkit-transform' : 'rotate(45deg)'
					})[0];

					if( this.canvas.width === 0 || this.canvas.height === 0 ){
						throw new Error('canvas has no height or width!');
					}

					jQuery(this.target).after(this.canvas);
					this.paper = Raphael(this.canvas, this.canvas.width, this.canvas.height);
					this.calculateNumDrawObjects();
					createItems.apply(this);
					this.fixedDrawing();
				}
				catch(e){
					debug_console( e.message, "error");
				}
		},
		
		calculateNumDrawObjects : function(){
			this.options.numCols = jQuery(this.canvas).width() / this.options.circleSize;
			this.options.numRows = jQuery(this.canvas).height() / this.options.circleSize;
			this.options.x_offset = this.options.circleSize * 2; // circle's radius times 2, so they don't overlap
			this.options.y_offset = this.options.circleSize * 2;
		},
		
		getTotalStaticks : function(){
			return jQuery('.statickContainer').length;
			// return totalItems;
		},
		
		// draw at a fixed rate
		fixedDrawing : function(){
			var self = this,
					drawFn = this.options.drawFunction;
					
			// this.stopDrawingInterval();
			
			drawFn.apply(self);

			self.drawIntervalHandle = setInterval(function(){
				drawFn.apply(self);
				},
				this.options.timing.baseTime
			);
		},
		
		stopDrawing: function(){
			clearInterval(this.drawIntervalHandle);
		},
		
		startDrawing: function(){
			this.fixedDrawing();
		},
		
		destroy: function(fade){
			debug_console( 'destroying statick action...', "debug");
			clearInterval(this.drawIntervalHandle); // stop the draw interval	
			var image = jQuery(this.canvas).siblings('img'); // preserve the original image
			// remove the added canvas div and positioning div
			if( fade ){
				jQuery(this.canvas).fadeOut( 700, function(){
					jQuery(this).remove(); 
					image.unwrap();
				});
			}
			else{
				jQuery(this.canvas).remove();
				image.unwrap();
			}
		}
	});
			
	// setup inspired by jcarousel plugin
   jQuery.fn.statick = function(option) {
		if (typeof option == 'string') {
			jQuery(this).each( function(){
				var instance = $(this).data('statick'), 
				args = Array.prototype.slice.call(arguments, 1);
				return instance[option].apply(instance, args);
			});
		} 
		else {
			return this.each(function() {
				$(this).data('statick', new jQuery.statick(this, option));
			});
		}
   };
	
})();

