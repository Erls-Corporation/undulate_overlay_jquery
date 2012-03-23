// presets should—at minimum—each include:
// ~ a name
// ~ a createItems function
// ~ a drawItems function.

var myPresets = [];

(function(){

  var defaultPreset = {
    presetName : "default (circle) Preset",
    attributes: {
      numRows : 20,
      numCols : 40,
      x_offset : 30,
      y_offset : 20,
      stroke : "rgba(255,255,255,0.5)",
      specialFX: {
        skipEvenColumns : false,
        skipOddColumns : false,
        skipEvenRows : false,
        skipOddRows : false,
        alternateRows : false,
        alternateRowsVal : 0,
        alternateColumns : true,
        alternateColumnsVal : 0
      }
    },
    createItems : function(){
      console.log("createItems");
      var i, j, circle, circleSize = 20;
      this.circles = [];

      for( j = 0; j < this.numCols; j++){
        this.circles[j] = [];
        for( i = 0; i < this.numRows; i++){
          circle = this.paper.circle( (j*this.x_offset), (i*this.y_offset), circleSize );
          if( this.stroke ){
            circle.attr("stroke", this.stroke);
          }
          this.circles[j][i] = circle;
        }
      }
    },
    drawItems : function(){  // draw function
      console.log("drawCircles");
      var i, j, red, green,
      palette = this.palettes;

      if( this.specialFX.alternateRows ){
        this.specialFX.alternateRowsVal = (this.specialFX.alternateRowsVal === 1 ) ? 0 : 1;
      }
      if( this.specialFX.alternateColumns ){
        this.specialFX.alternateColumnsVal = (this.specialFX.alternateColumnsVal === 1 ) ? 0 : 1;
      }

      for( j = 0; j < this.numCols; j++){
        for( i = 0; i < this.numRows; i++){

          // special fx!
          // ****
          // row/column filtering
          if( (this.specialFX.skipEvenColumns && j%2 === 0) 
          || (this.specialFX.skipOddColumns && j%2 === 1)){
            continue;
          }
          else if((this.specialFX.skipEvenRows && i%2 === 0) 
          || (this.specialFX.skipOddRows && i%2 === 1)){
            continue;
          }
          // alternation
          if( this.specialFX.alternateRows ){
            if(i%2 === this.specialFX.alternateRowsVal){
              this.circles[j][i].attr('opacity', 0);
            }
            else{
              this.circles[j][i].attr('opacity', 1);
            }
          }
          if( this.specialFX.alternateColumns ){
            if(j%2 === this.specialFX.alternateColumnsVal){
              this.circles[j][i].attr('opacity', 0);
            }
            else{
              this.circles[j][i].attr('opacity', 1);
            }
          }        

          // circle.drag(move, start, up);
          switch( this.colorMethod ){
            case "palette":
            this.circles[j][i].attr("fill", "#" + palette[this.currentPaletteIndex]['colors'][randomRange(0, palette[0]['colors'].length -1)] );	
            break;
            default:
            red = Math.floor(Math.random()*256);
            green = 128 + Math.floor(Math.random()*128);
            blue = 255;
            this.circles[j][i].attr("fill", "rgb("+ red +","+green+","+blue+")");	
            break;
          }

        }
      }
    }
  }

  var staticPreset = { 
    presetName : "static Preset",
    pixelSize : 16,
    createItems : function(){
      console.log("createStatic");
      var i, j, square,	squareWidth, squareHeight;
      this.squares = [];

      // TEMP
      this.x_offset = this.pixelSize;
      this.y_offset = this.pixelSize;
      squareWidth = this.pixelSize;
      squareHeight = this.pixelSize;
      this.numCols = this.canvasWidth / squareWidth;
      this.numRows = this.canvasHeight / squareHeight;		

      for( j = 0; j < this.numCols; j++){
        this.squares[j] = [];
        for( i = 0; i < this.numRows; i++){

          square = this.paper.rect( (j*this.x_offset), (i*this.y_offset), squareWidth, squareHeight );
          // square.attr("stroke", "rgba(255,255,255,0.5)");
          this.squares[j][i] = square;

        }
      }
    },
    drawItems : function(){
      // console.log( this.presetName);

      var i, j, random, color;

      for( j = 0; j < this.numCols; j++){
        for( i = 0; i < this.numRows; i++){
          color = (randomRange(0,1) === 1) ? "rgb(0,0,0)" : "rgb(255,255,255)";
          this.squares[j][i].attr({"fill" : color, 'stroke-width' : 0});	
        }
      }		

    } 
  };

  var bigStaticExtension = {
    presetName : "static Preset Big",
    drawItems : staticPreset.drawItems,
    createItems : staticPreset.createItems,
    pixelSize : 32
  }

  var sparseCirclesExtension = jQuery.extend(true, {}, defaultPreset, {
    presetName : "circles no overlap",
    attributes:{
      numRows : 11,
      numCols : 30,
      x_offset : 40,
      y_offset : 40,
      stroke : null
    }
  });

  var sparseCirclesSkipEvenColumnsExtension = jQuery.extend(true, {}, sparseCirclesExtension, {
    presetName : "circles skip evens no overlap",
    attributes:{
      stroke : "rgba(0,0,0,0)",
      specialFX: {
        skipEvenColumns : true
      },
      stroke : "rgba(0,0,0,0)"
    }
  });

  var sparseCirclesSkipOddColumnsExtension = jQuery.extend(true, {}, sparseCirclesSkipEvenColumnsExtension, {
    presetName : "circles skip odds no overlap",
    attributes:{
      specialFX: {
        skipEvenColumns : false,
        skipOddColumns : true
      },
      stroke : "rgba(0,0,0,0)"
    }
  });


  var sparseCirclesSkipOddRowsExtension = jQuery.extend(true, {}, sparseCirclesExtension, {
    presetName : "circles skip odds no overlap",
    attributes:{
      specialFX: {
        stroke : "rgba(0,0,0,0)",
        skipOddRows : true
      },
      stroke : "rgba(0,0,0,0)"
    }
  });
  
  myPresets = [
            defaultPreset, 
            staticPreset, 
            bigStaticExtension, 
            sparseCirclesExtension, 
            sparseCirclesSkipEvenColumnsExtension,
            sparseCirclesSkipOddColumnsExtension, 
            sparseCirclesSkipOddRowsExtension
            ]
}());