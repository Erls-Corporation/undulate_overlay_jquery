(function(){

	/**
   * The statick object.
   *
   * @constructor
   * @class statick
   * @param e {HTMLElement} The element to create the carousel for.
   * @param o {Object} A set of key/value pairs to set as configuration properties.
   * @cat Plugins/jCarousel
   */

		var methods = {

			_init : function(options){

				// Create some defaults, extending them with any options that were provided
		    var settings = $.extend( {
		      color         : 'red',
		      title : 'supertitular'
		    }, options);

				debug_console( 'init\'ing statick');

				// return this.each(function(){
				// 
				// 				var $this = $(this),
				// 				data = $this.data('statick')
				// 
				// 				// If the plugin hasn't been initialized yet
				// 				if ( !data ) {
				// 
				// 					$(this).data('tooltip', {
				// 						target : $this,
				// 						tooltip : tooltip
				// 					});
				// 
				// 				}
				// 			});
			
			},

			loadLocalStorage : function(){

				this.currentImageIndex = localStorage.getItem('undulate_overlay_currentImageIndex');

				var opacity = localStorage.getItem('undulate_overlay_current_opacity');
				opacity = (opacity) ? parseFloat(opacity) : this.attributes.canvasOpacity;
				jQuery('#canvas').css('opacity', opacity);  // needs to be 0-1 scale for css
				this.attributes.canvasOpacity = opacity * 100; // needs to be 0-100 scale for jquery ui slider
				jQuery('#opacityValue').text(parseInt(opacity * 100));

				var baseTime = localStorage.getItem('undulate_overlay_current_baseTime');
				if(baseTime){
					this.attributes.timing.baseTime = baseTime;
					jQuery('#baseTimeValue').text(baseTime + " ms");
				}

				var milliseconds = localStorage.getItem('undulate_overlay_time_patterns_retrieved_at', new Date().getTime() );
				if(milliseconds){
					this.timeSinceLastPatternGet = parseInt(milliseconds, 10);
				}

			},

			loadImages : function(){

				var image; 

				images = [];
				currentImageIndex = 0;

				jQuery.get( 'images/image_list.txt', function(data){

					settings.images = jQuery.trim(data).split(';');

					for( var item in settings.images ){
						image = new Image();
						settings.images[item] = 'images/' + settings.images[item]; // path to images
						image.src =  settings.images[item];
					}
					
					debug_console( images.length + ' images loaded' );
					
					methods['updateImage'].apply(this, Array.prototype.slice.call( false ));

				});

			},

			setupControls : function(){
				var that = this;

				jQuery('.paletteControl').click(function(e){
					e.preventDefault();
					if( jQuery(this).attr('id') === 'nextPalette' ){
						that.nextPalette();
					}
					else{
						that.previousPalette();	
					}
				});

				jQuery('.imageControl').click(function(e){
					e.preventDefault();
					if( jQuery(this).attr('id') === 'nextImage' ){
						that.nextImage();
					}
					else{
						that.previousImage();	
					}
				});		

					jQuery("#opacitySlider").slider({
						slide: function(){
							var value = jQuery(this).slider('value');
							console.log(value);
							jQuery('#opacityValue').text(value);
							jQuery('#canvas').css('opacity', value/100.0);
						},
						change: function(){
							// TODO: be nice to DRY this out somehow
							var value = jQuery(this).slider('value');
							console.log(value);
							jQuery('#opacityValue').text(value);
							jQuery('#canvas').css('opacity', value/100.0);
						},
						max: 100,
						value: that.attributes.canvasOpacity});

					jQuery("#baseTimeSlider").slider({
						change: function(){
							var value = jQuery(this).slider('value');
							console.log(value);
							jQuery('#baseTimeValue').text(value + " ms");
							that.attributes.timing.baseTime = value;
							that.fixedDrawing();
						},
						min: 50,
						max: that.attributes.timing.maxTime,
						value: that.attributes.timing.baseTime});		

					jQuery(window).unload(function() {
						localStorage.setItem('undulate_overlay_current_colors', JSON.stringify(that.attributes.palettes[that.attributes.currentPaletteIndex].colors) );
						localStorage.setItem('undulate_overlay_palettes', JSON.stringify(that.attributes.palettes) );
						localStorage.setItem('undulate_overlay_current_opacity', jQuery('#canvas').css('opacity'));
						localStorage.setItem('undulate_overlay_current_baseTime', that.attributes.timing.baseTime);
						localStorage.setItem('undulate_overlay_currentImageIndex', that.currentImageIndex);
					});

					// setup preset selection
					var $dropdown = jQuery('#presetSelect'), newOption;
					for( var preset in this.presets ){
						newOption = jQuery('<option>');
						newOption.val(preset);
						newOption.text(this.presets[preset].presetName );
						$dropdown.append(newOption);
					}

					$dropdown.change(function(evt){
						console.log('switching to preset ' + that.presets[parseInt($dropdown.val(), 10)].presetName);
						that.stopDrawingInterval();
						that.paper.clear();
						jQuery.extend( true, UNDULATE, that.presets[parseInt($dropdown.val(), 10)] );
						that.createItems();
						that.fixedDrawing();
					});

				},
			  // setPalette : function(newIndex){
			  //  try{
			  //    if( isNaN(newIndex) ){
			  //      throw new Error('palette index is not a number!');
			  //    }
			  //    if( newIndex >= this.attributes.palettes.length || newIndex < 0 ){
			  //      throw new Error('palette index is out of bounds');
			  //    }
			  //    this.attributes.currentPaletteIndex = newIndex;
			  //  }catch(e){
			  //    console.log('failure in setPalette ' + e.message + '; setting currentPaletteIndex to 0');
			  //    this.attributes.currentPaletteIndex = 0;
			  //  }
			  // },
			  // getPalette: function(){
			  //  return this.attributes.currentPaletteIndex;
			  // },

				nextPalette : function(){
					if(++this.attributes.currentPaletteIndex >= this.attributes.palettes.length ){
						this.attributes.currentPaletteIndex = 0;
					}
				},
				previousPalette : function(){
					if(--this.attributes.currentPaletteIndex < 0){
						this.attributes.currentPaletteIndex = this.attributes.palettes.length -1;
					}
				},
				nextImage : function(){
					if(++this.currentImageIndex >= this.images.length ){
						this.currentImageIndex = 0;
					}
					this.updateImage();
				},
				previousImage : function(){
					if(--this.currentImageIndex < 0 ){
						this.currentImageIndex = this.images.length - 1;
					}
					this.updateImage();
				},
				updateImage : function(fade){

					// fade = (fade !== undefined) ? fade : true;
					// var that = this;
					// 
					// if( fade ){
					// 	jQuery('#overlayImage').fadeTo( 120, 0, 'easeOutSine', function(){
					// 		jQuery(this).attr('src', that.images[that.currentImageIndex]);
					// 		jQuery(this).fadeTo(400, 1, 'easeOutSine');
					// 	});
					// }
					// else{
					// 	jQuery('#overlayImage').attr('src', that.images[that.currentImageIndex]);
					// }

				},

				// draw at a fixed rate
				fixedDrawing : function(){
					var that = this;

					this.stopDrawingInterval();
					that.drawItems();

					this.drawIntervalHandle = setInterval(function(){
						that.drawItems();
						},
						this.attributes.timing.baseTime
					);

				},
				stopDrawingInterval : function(){
					clearInterval(this.drawIntervalHandle);
				},
				loadPalettes : function(options){

					var that = this, 
			    		options = options || {};
			    		numPalettes = options.numPalettes || 5;

					// only make an ajax call to colourlovers if it's been over a day
					if( that.timeSinceLastPatternGet === null // if we've never made an ajax call for patterns
						|| ((new Date().getTime() - that.timeSinceLastPatternGet) / (1000 * 60 * 60 * 24)) > 1  // if the last time we made an ajax call was over a day ago
						|| that.forcePatternAJAXGet ){ // or if we want to force an ajax retrieval

						console.log( 'using ajax call to colour lovers for pattern retrieval' );

						jQuery.ajax({
							url: "http://www.colourlovers.com/api/palettes/top?jsonCallback=?", 
							dataType: 'json',
							data: {numResults: numPalettes},
							success: function(data){
								console.log('got ' + data.length + ' palettes!');
								that.attributes.palettes = data;
								localStorage.setItem('undulate_overlay_time_patterns_retrieved_at', new Date().getTime() );
							}
						});

					}
					else{
						console.log( 'using local storage for pattern retrieval' );
						that.attributes.palettes = JSON.parse(localStorage.getItem('undulate_overlay_palettes'));
					}

				}
			}
			
		jQuery.fn.statick = function( method ){
		
			// Method calling logic
			if ( methods[method] ) {
				return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
			} else if ( typeof method === 'object' || ! method ) {
				return methods._init.apply( this, arguments );
			} else {
				jQuery.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
			}    
		}

		// jcarousel way
    // $.fn.jcarousel = function(o) {
    //     if (typeof o == 'string') {
    //         var instance = $(this).data('jcarousel'), args = Array.prototype.slice.call(arguments, 1);
    //         return instance[o].apply(instance, args);
    //     } else {
    //         return this.each(function() {
    //             $(this).data('jcarousel', new $jc(this, o));
    //         });
    //     }
    // };
	
})();



