
var UNDULATE = {
  presetName : null,
	presets : myPresets, // available presets to choose from
	drawIntervalHandle: null, // the handle for the setInterval timing of the canvas redraws
	timeSinceLastPatternGet : null, // in milliseconds
	forcePatternAJAXGet : false, 
	palettes : null, // palettes from colourlovers.com
	currentPaletteIndex: 0,
	sliderTimingMin: 50,
	sliderTimingMax: 600,
	
	init : function(){
		this.loadImages();
		this.statickImage = jQuery('.statick').statick({ 'opacity' : 0.5, timing : { 'baseTime' : 50 } });
		this.statickImageInstance = this.statickImage.data('statick');
		this.timing = this.statickImage.data('statick').timing;
		this.opacity = this.statickImage.data('statick').opacity;
		this.canvas = this.statickImage.data('statick').canvas;
		this.loadLocalStorage();
		this.setupControls();
	},
	
	loadLocalStorage: function(){
		
		this.currentImageIndex = localStorage.getItem('undulate_overlay_currentImageIndex');
		
		// todo temp broken
		// var opacity = localStorage.getItem('undulate_overlay_current_opacity');
		var opacity = (opacity) ? parseFloat(opacity) : this.opacity;
		jQuery(this.canvas).css('opacity', opacity);  // needs to be 0-1 scale for css
		jQuery('#opacityValue').text(parseInt(opacity * 100));
		
		var baseTime = localStorage.getItem('undulate_overlay_current_baseTime');
		if(baseTime){
			this.timing.baseTime = baseTime;
			jQuery('#baseTimeValue').text(baseTime + " ms");
		}
		
		var milliseconds = localStorage.getItem('undulate_overlay_time_patterns_retrieved_at', new Date().getTime() );
		if(milliseconds){
			this.timeSinceLastPatternGet = parseInt(milliseconds, 10);
		}
		
	},
	
	loadImages: function(){
		var image;
		
		this.images = [];
		this.currentImageIndex = 0;

    jQuery.get( 'images/image_list.txt', function(data){
    
      UNDULATE.images = jQuery.trim(data).split(';');
    
      for( var item in UNDULATE.images ){
        image = new Image();
        UNDULATE.images[item] = 'images/' + UNDULATE.images[item]; // path to images
        image.src =  UNDULATE.images[item];
      }
    
      UNDULATE.updateImage(false);
    });
		
	},
	
	setupControls : function(){
		
		jQuery('.paletteControl').click(function(e){
			e.preventDefault();
			if( jQuery(this).attr('id') === 'nextPalette' ){
				UNDULATE.nextPalette();
			}
			else{
				UNDULATE.previousPalette();	
			}
		});
		
		jQuery('.imageControl').click(function(e){
			e.preventDefault();
			if( jQuery(this).attr('id') === 'nextImage' ){
				UNDULATE.nextImage();
			}
			else{
				UNDULATE.previousImage();	
			}
		});	
		
		var sliderChange = function(){
			var $slider = jQuery(this),
				opacityValue = $slider.slider('value');
			console.log(opacityValue);
			jQuery('#opacityValue').text(opacityValue);
			jQuery(UNDULATE.canvas).css('opacity', opacityValue/100.0);
		};
		
		jQuery("#opacitySlider").slider({
			slide: sliderChange,
			change: sliderChange,
			max: 100,
			value: UNDULATE.opacity * 100}
		);

		jQuery("#baseTimeSlider").slider({
			change: function(){
				var value = jQuery(this).slider('value');
				console.log(value);
				jQuery('#baseTimeValue').text(value + " ms");
				UNDULATE.timing.baseTime = value;
				UNDULATE.statickImageInstance.stopDrawing();
				UNDULATE.statickImageInstance.startDrawing();
			},
			min: UNDULATE.sliderTimingMin,
			max: UNDULATE.sliderTimingMax,
			value: UNDULATE.statickImageInstance.timing.baseTime});		
			
		jQuery(window).unload(function() {
			localStorage.setItem('undulate_overlay_current_colors', JSON.stringify(UNDULATE.palettes[UNDULATE.currentPaletteIndex].colors) );
			localStorage.setItem('undulate_overlay_palettes', JSON.stringify(UNDULATE.palettes) );
			localStorage.setItem('undulate_overlay_current_opacity', jQuery(UNDULATE.canvas).css('opacity'));
			localStorage.setItem('undulate_overlay_current_baseTime', UNDULATE.timing.baseTime);
			localStorage.setItem('undulate_overlay_currentImageIndex', UNDULATE.currentImageIndex);
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
			console.log('switching to preset ' + UNDULATE.presets[parseInt($dropdown.val(), 10)].presetName);
			UNDULATE.stopDrawingInterval();
			UNDULATE.statickImageInstance.paper.clear();
			jQuery.extend( true, UNDULATE, UNDULATE.presets[parseInt($dropdown.val(), 10)] );
			// todo need updating with new refactoring
			// UNDULATE.statickImageInstance.createItems();
			// UNDULATE.fixedDrawing();
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
  //    this.currentPaletteIndex = newIndex;
  //  }catch(e){
  //    console.log('failure in setPalette ' + e.message + '; setting currentPaletteIndex to 0');
  //    this.currentPaletteIndex = 0;
  //  }
  // },
  // getPalette: function(){
  //  return this.currentPaletteIndex;
  // },

	nextPalette: function(){
		if(++this.currentPaletteIndex >= this.palettes.length ){
			this.currentPaletteIndex = 0;
		}
	},
	
	previousPalette: function(){
		if(--this.currentPaletteIndex < 0){
			this.currentPaletteIndex = this.palettes.length -1;
		}
	},
	
	nextImage: function(){
		if(++this.currentImageIndex >= this.images.length ){
			this.currentImageIndex = 0;
		}
		this.updateImage();
	},
	
	previousImage: function(){
		if(--this.currentImageIndex < 0 ){
			this.currentImageIndex = this.images.length - 1;
		}
		this.updateImage();
	},
	
	updateImage: function(fade){
		fade = (fade !== undefined) ? fade : true;
		
		if( fade ){
			jQuery('#overlayImage').fadeTo( 120, 0, 'easeOutSine', function(){
				jQuery(this).attr('src', UNDULATE.images[UNDULATE.currentImageIndex]);
				jQuery(this).fadeTo(400, 1, 'easeOutSine');
			});
		}
		else{
			jQuery('#overlayImage').attr('src', UNDULATE.images[UNDULATE.currentImageIndex]);
		}
	
	},
	createItems : null,
	drawItems : null,
	
	// draw at a fixed rate
	// fixedDrawing : function(){
	// 	var that = this;
	// 
	// 	this.stopDrawingInterval();
	// 	that.drawItems();
	// 	
	// 	this.drawIntervalHandle = setInterval(function(){
	// 		that.drawItems();
	// 		},
	// 		this.timing.baseTime);
	// 
	// },
	
	stopDrawingInterval : function(){
		clearInterval(this.drawIntervalHandle);
	},
	
	loadPalettes : function(options){
		
		var options = options || {},
    		numPalettes = options.numPalettes || 5;
		
		// only make an ajax call to colourlovers if it's been over a day
		if( UNDULATE.timeSinceLastPatternGet === null // if we've never made an ajax call for patterns
			|| ((new Date().getTime() - UNDULATE.timeSinceLastPatternGet) / (1000 * 60 * 60 * 24)) > 1  // if the last time we made an ajax call was over a day ago
			|| UNDULATE.forcePatternAJAXGet ){ // or if we want to force an ajax retrieval

			console.log( 'using ajax call to colour lovers for pattern retrieval' );

			jQuery.ajax({
				url: "http://www.colourlovers.com/api/palettes/top?jsonCallback=?", 
				dataType: 'json',
				data: {numResults: numPalettes},
				success: function(data){
					console.log('got ' + data.length + ' palettes!');
					UNDULATE.palettes = data;
					localStorage.setItem('undulate_overlay_time_patterns_retrieved_at', new Date().getTime() );
				}
			});

		}
		else{
			console.log( 'using local storage for pattern retrieval' );
			UNDULATE.palettes = JSON.parse(localStorage.getItem('undulate_overlay_palettes'));
		}
	}
};


//  BEGIN
jQuery( function(){

	UNDULATE.loadPalettes({numPalettes: 5});
	
		var palettesReady = function(){
			if( UNDULATE.palettes == null ){
				setTimeout( palettesReady, 100 );
			}
			else{
				UNDULATE.init();
			}
		};

		palettesReady();
	// if( false ){
	// 	secondsSineBasedDrawing();
	// }
	// else{
	// 	
	// 	var palettesReady = function(){
	// 		if( UNDULATE.attributes.palettes == null ){
	// 			setTimeout( palettesReady, 100 );
	// 		}
	// 		else{
	// 			UNDULATE.fixedDrawing();
	// 		}
	// 	};
	// 	
	// 	palettesReady();
	// 	
	// }
	
});


function secondsSineBasedDrawing(){
	
	var val = 0,
			rateChangeInterval = 3000;
			
	setInterval( function(){
		// get the number of seconds to delay the circle redraws based upon a sine wave
		var secondsSine = (Math.sin(val));
		secondsSine = roundNumber( secondsSine, 4 );
		var sineBasedIntervalForCircleRedraw = computeTimeIntervalBasedOnSine(secondsSine, UNDULATE.timing.baseTime, UNDULATE.timing.millisecondsToDelay);
		
		// console.log('setting interval to: ' + sineBasedIntervalForCircleRedraw ); // higher intervals mean longer time between circle redraws
		jQuery('#debug span').text( 'redraw interval: ' + sineBasedIntervalForCircleRedraw);
		// clear any previous interval for the redraw
		clearInterval(UNDULATE.drawIntervalHandle);
		
		// call the redraw immediately so that there's no delay
		UNDULATE.drawCircles();
		
		UNDULATE.drawIntervalHandle = setInterval(function(){
			UNDULATE.drawCircles();
			},
			sineBasedIntervalForCircleRedraw);
		
		val += (Math.PI / 8); // increment in values of PI/8
		
		// console.log( 'secondsSine: ' + secondsSine );
		
		}, rateChangeInterval)
	
}


function computeTimeIntervalBasedOnSine(sineValue, baseTime, millisecondsToDelay){
	var timeDelay = baseTime + Math.abs(sineValue * millisecondsToDelay)
	return Math.round(timeDelay);
}

function roundNumber(num, dec) {
	return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
}

function randomRange(min,max){
	return Math.round(((max-min) * Math.random()) + min);
}
