jQuery( function(){

	jQuery('.statick').statick();
	
	return;
	
	function drawItems2(){  // draw function
		var grayVal = randomRange(30,240);
    for ( j = 0; j < this.options.numCols; j++){
      for ( i = 0; i < this.options.numRows; i++){
          this.circles[j][i].attr("fill", "rgb("+grayVal+","+grayVal+","+grayVal+")");	
      }
    }
	};

	// jQuery('#overlayImage').statick();
	jQuery('#statick1').statick(
		{
			timing : { baseTime: 50 },
			drawFunction: drawItems2,
			opacity: 0.1
		}
	);
	jQuery('#statick2').statick(
		{opacity: 0.3}
	);


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
		var sineBasedIntervalForCircleRedraw = computeTimeIntervalBasedOnSine(secondsSine, UNDULATE.attributes.timing.baseTime, UNDULATE.attributes.timing.millisecondsToDelay);
		
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

var start = function () {
							// storing original coordinates
							this.ox = this.attr("cx");
							this.oy = this.attr("cy");
							//this.attr({opacity: 1});
						},
		move = function (dx, dy) {
			// move will be called with dx and dy
			this.attr({cx: this.ox + dx, cy: this.oy + dy});
		},
		up = function () {
			// restoring state
			//this.attr({opacity: .5});
		};		
		
		
		
		
		
	

