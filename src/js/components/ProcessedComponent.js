import React from "react";
import styles from './style/style.css';

export default class ProcessedComponent extends React.Component {

  constructor(props) {
	super(props);
	this.componentRoutine = this.componentRoutine.bind(this);
	this.processImage = this.processImage.bind(this);
  }

  processImage() { 
	if ( this.props.desc_data['type'] == 0 )
	  return this.imageIsOriginal();
	else if( this.props.desc_data['type'] == 1 )
	  return this.imageIsGrayscale();
	else if( this.props.desc_data['type'] == 2 )
	  return this.imageIsNegative();
	else if( this.props.desc_data['type'] == 3 )
	  return this.imageIsBoxBlur();
	else if( this.props.desc_data['type'] == 4 )
	  return this.imageIsSharpen();
	else if( this.props.desc_data['type'] == 5 )
	  return this.imageIsZoom();
	else if( this.props.desc_data['type'] == 6 )
	  return this.imageIsEdgeDetection();
	else if( this.props.desc_data['type'] == 7 )
	  return this.imageIsHoG();
  }

  imageIsOriginal(imageData) {
	//get the pixel data and return the sanitary data
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	return imageData;
  }

  imageIsGrayscale() {
	//get the pixel data
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;

	//gray the pixels: averaging and replacing red, green, and blue values. *Note, to calibrate for the humany eye the weight of each values is variable.
	for(var i = 0; i < data.length; i += 4) {
	  var shade = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
	  data[i] = data[i + 1] = data[i + 2] = shade;
	} 

	return imageData;
  }

  imageIsNegative() {
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;

	//negate the pixels, subtract the max value from the current value.
	for(var i = 0; i < data.length; i += 4) {
	  data[i] = 255 - data[i];
	  data[i + 1] = 255 - data[i + 1];
	  data[i + 2] = 255 - data[i + 2];
	}

	return imageData;
  }

  imageIsBoxBlur() {
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;
	var tempData = new Uint8ClampedArray(data);

	//blur the pixels: sum the pixel(x,y) with neighboring pixels and average.
	for(var j = 0; j < 5; j++) {
	  tempData = data;
	  /* edge case: top */
	  for(var i = 4; i < 1600; i+=4) {
	    data[i] = Math.floor(1/6*(tempData[i] + tempData[i + 4] + tempData[i - 4] + tempData[i + 1600] + tempData[i + 1604] + tempData[i + 1596]));
	    data[i + 1] = Math.floor(1/6*(tempData[i + 1] + tempData[i + 4 + 1] + tempData[i - 4 + 1] + tempData[i + 1600 + 1] + tempData[i + 1604 + 1] + tempData[i + 1596 + 1]));
	    data[i + 2] = Math.floor(1/6*(tempData[i + 2] + tempData[i + 4 + 2] + tempData[i - 4 + 2] + tempData[i + 1600 + 2] + tempData[i + 1604 + 2] + tempData[i + 1596 + 2]));
	  }
	  /* edge case: bottom */
	  for(var i = (data.length - 1596); i < data.length; i += 4) {
	    data[i] = Math.floor(1/6*(tempData[i] + tempData[i + 4] + tempData[i - 4] + tempData[i - 1600] + tempData[i - 1604] + tempData[i - 1596]));	    
	    data[i + 1] = Math.floor(1/6*(tempData[i + 1] + tempData[i + 4 + 1] + tempData[i - 4 + 1] + tempData[i - 1600 + 1] + tempData[i - 1604 + 1] + tempData[i - 1596 + 1]));	    
	    data[i + 2] = Math.floor(1/6*(tempData[i + 2] + tempData[i + 4 + 2] + tempData[i - 4 + 2] + tempData[i - 1600 + 2] + tempData[i - 1604 + 2] + tempData[i - 1596 + 2]));	    
	  }
	  /* edge case: left */
	  for(var i = 1600; i < data.length - 1600; i+=1600) {
	    data[i] = Math.floor(1/6*(tempData[i] + tempData[i + 4] + tempData[i + 1600] + tempData[i + 1604] + tempData[i - 1600] + tempData[i - 1596]));	    
	    data[i + 1] = Math.floor(1/6*(tempData[i + 1] + tempData[i + 4 + 1] + tempData[i + 1600 + 1] + tempData[i + 1604 + 1] + tempData[i - 1600 +1] + tempData[i - 1596 + 1]));	    
	    data[i + 2] = Math.floor(1/6*(tempData[i + 2] + tempData[i + 4 + 2] + tempData[i + 1600 + 2] + tempData[i + 1604 + 2] + tempData[i - 1600 + 2] + tempData[i - 1596 + 2]));	    
	  }
	  /* edge case: right */
	  for(var i = 3196; i < data.length - 1600; i+=1600) {
	    data[i] = Math.floor(1/6*(tempData[i] + tempData[i - 4] + tempData[i + 1600] + tempData[i - 1604] + tempData[i - 1600] + tempData[i + 1596]));	    
	    data[i + 1] = Math.floor(1/6*(tempData[i + 1] + tempData[i - 4 + 1] + tempData[i + 1600 + 1] + tempData[i - 1604 + 1] + tempData[i - 1600 + 1] + tempData[i + 1596 + 1]));	    
	    data[i + 2] = Math.floor(1/6*(tempData[i + 2] + tempData[i - 4 + 2] + tempData[i + 1600 + 2] + tempData[i - 1604 + 2] + tempData[i - 1600 + 2] + tempData[i + 1596 + 2]));	    
	  }
	  for(var i = 1600; i < (data.length - 1600); i += 4) {
	    if( i%1600!=0 && i%1600!=1596 ) {
	      data[i] = Math.floor(1/9*(tempData[i] + tempData[i + 4] + tempData[i - 4] + tempData[i + 1600] + tempData[i + 1604] + tempData[i + 1596] + tempData[i - 1600] + tempData[i - 1596] + tempData[i - 1604]));
	      data[i + 1] = Math.floor(1/9*(tempData[i + 1] + tempData[i + 4 + 1] + tempData[i - 4 + 1] + tempData[i + 1600 + 1] + tempData[i + 1604 + 1] + tempData[i + 1596 +1] + tempData[i - 1600 + 1] + tempData[i - 1596 + 1] + tempData[i - 1604 + 1]));
	      data[i + 2] = Math.floor(1/9*(tempData[i + 2] + tempData[i + 4 + 2] + tempData[i - 4 + 2] + tempData[i + 1600 + 2] + tempData[i + 1604 + 2] + tempData[i + 1596 +2] + tempData[i - 1600 + 2] + tempData[i - 1596 + 2] + tempData[i - 1604 + 2]));
	    }
	  }
	}
	return imageData;
  }

  imageIsSharpen() {
  	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;
	var tempData = new Uint8ClampedArray(data);

	//sharpen the pixels, sum the neighboring pixels negate the sum of neighbors from 9 times the current pixel(x,y).
	for(var i = 1600; i < (data.length - 1600); i += 4) {
	  if( i%1600!=0 && i%1600!=1596 ) {
	    data[i] = Math.floor( ((9*tempData[i]) - (tempData[i + 4] + tempData[i - 4] + tempData[i + 1600] + tempData[i + 1604] + tempData[i + 1596] + tempData[i - 1600] + tempData[i - 1596] + tempData[i - 1604])) );
	    data[i + 1] = Math.floor( ((9*tempData[i + 1]) - (tempData[i + 4 + 1] + tempData[i - 4 + 1] + tempData[i + 1600 + 1] + tempData[i + 1604 + 1] + tempData[i + 1596 +1] + tempData[i - 1600 + 1] + tempData[i - 1596 + 1] + tempData[i - 1604 + 1])) );
	    data[i + 2] = Math.floor( ((9*tempData[i + 2]) - (tempData[i + 4 + 2] + tempData[i - 4 + 2] + tempData[i + 1600 + 2] + tempData[i + 1604 + 2] + tempData[i + 1596 +2] + tempData[i - 1600 + 2] + tempData[i - 1596 + 2] + tempData[i - 1604 + 2])) );
	  }
	}

	return imageData;
  }

  imageIsZoom() { 
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;
	var tempData = new Uint8ClampedArray(data);

	for(var i=0; i < (400*this.refs.canvas.height/this.refs.canvas.width)/2; i++) {
	  for(var j=0; j < 800; j+=4) {
		var curIndex = (i*1600 + j);

		/* copy self into position */
		data[2*curIndex] = tempData[curIndex]; 			//red 
		data[2*curIndex + 1] = tempData[curIndex + 1]; 	//green
		data[2*curIndex + 2] = tempData[curIndex + 2]; 	//blue

		/* +4 indicates one pixel to the right. Calculation interpolates with neighboring pixel. */
		data[2*curIndex + 4] = (tempData[curIndex] + tempData[curIndex + 4])/2;
		data[2*curIndex + 4 + 1] = (tempData[curIndex + 1] + tempData[curIndex + 4 + 1])/2;
		data[2*curIndex + 4 + 2] = (tempData[curIndex + 2] + tempData[curIndex + 4 + 2])/2;

		/* +1600 indicates one pixel down. */ 
		data[2*curIndex + 1600] = (tempData[curIndex] + tempData[curIndex + 1600])/2;
		data[2*curIndex + 1600 + 1] = (tempData[curIndex + 1] + tempData[curIndex + 1600 + 1])/2;
		data[2*curIndex + 1600 + 2] = (tempData[curIndex + 2] + tempData[curIndex + 1600 + 2])/2;

		/* 1604 indicates one pixel down and right. */
		data[2*curIndex + 1604] = (tempData[curIndex] + tempData[curIndex + 1604])/2;
		data[2*curIndex + 1604 + 1] = (tempData[curIndex + 1] + tempData[curIndex + 1604 + 1])/2;
		data[2*curIndex + 1604 + 2] = (tempData[curIndex + 2] + tempData[curIndex + 1604 + 2])/2;
	  }
	}

	return imageData;
  }

  imageIsEdgeDetection() {
  	//get the pixel data off of the canvas
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;
	var tempData = new Uint8ClampedArray(data);

	//gray the pixels
	for(var i = 0; i < tempData.length; i += 4) {
	  var shade = 0.3 * tempData[i] + 0.59 * tempData[i + 1] + 0.11 * tempData[i + 2];
	  tempData[i] = tempData[i + 1] = tempData[i + 2] = shade;
	}

	//apply convolution mask
	for(var i = 1600; i < (tempData.length - 1600); i += 4) {
	  if( i%1600!=0 && i%1600!=1596 ) {
	    var conv_x = (tempData[i - 1596] + ( tempData[i + 4]*2 ) + tempData[i + 1604] ) - ( tempData[i - 1604] + (tempData[i - 4]*2) + tempData[i + 1596] );
	    var conv_y = (tempData[i - 1604] + ( tempData[i - 1600]*2 ) + tempData[i - 1596] ) - ( tempData[i + 1596] + (tempData[i + 1600]*2) + tempData[i + 1604] );

	    //calculate the manhatten distance
	    var manhattenDistance = Math.abs(conv_x) + Math.abs(conv_y);

	    //invert color
	    manhattenDistance = 255 - manhattenDistance;

	    //normalize
	    if(manhattenDistance > 255)
	      manhattenDistance = 255;
	    else if(manhattenDistance < 128)
	      manhattenDistance = 0;

	    data[i] = data[i + 1] = data[i + 2] = manhattenDistance;
	  }
	}

    return imageData;	
  }

  imageIsHoG() {
  	//get the pixel data off of the canvas
	var ctx = this.refs.canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
	var data = imageData.data;
	var tempData = new Uint8ClampedArray(data);

	for(var i = 0; i < data.length; i += 4) {
	  var shade = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
	  tempData[i] = tempData[i + 1] = tempData[i + 2] = shade;
	} 

	for(var i = 0; i < (400*this.refs.canvas.height/this.refs.canvas.width); i+=16) {
		for(var j = 0; j < 1600; j+=4) { 
			var curIndex = (i*1600 + j);
			data[curIndex] = data[curIndex + 1] = data[curIndex + 2] = 255;
		}
	}

	for(var j = 0; j < 1600; j+=4*16) {
		for(var i = 0; i < (400*this.refs.canvas.height/this.refs.canvas.width); i++) { 
			var curIndex = (i*1600 + j);
			data[curIndex] = data[curIndex + 1] = data[curIndex + 2] = 255;
		}
	}

	var grid = [], arr_of_tuples = [];
	for(var i = 0; i < (400*this.refs.canvas.height/this.refs.canvas.width); i++) { 
  		for(var j = 0; j < 1600; j+=4 ) {
  			var curIndex = (i*1600 + j), gradX = 0, gradY = 0, angle = 0, magnitude = 0;
  			if(j!=0 && j!=1596) //avoid edges
  				gradX = tempData[curIndex + 4] - tempData[curIndex - 4];
  			if(i!=0 && i!=(400*this.refs.canvas.height/this.refs.canvas.width-1) ) //avoid edges
  				gradY = tempData[curIndex - 1600] - tempData[curIndex + 1600];
  			magnitude = Math.sqrt( ( (gradX*gradX) + (gradY*gradY) ) );	
  			angle = Math.floor(Math.atan(gradY/gradX)*57.29+90); // arctan(y/x) provides radians, 1 radian is 57.29 degrees, shift angle from (-90,90) to (0,180)
  			if(isNaN(angle))
				angle = 0;
			arr_of_tuples.push([magnitude,angle]);
		}
		grid.push(arr_of_tuples);
		arr_of_tuples = [];
  	}
	
	var bin = [0,0,0,0,0,0,0,0,0]
	var grid_of_bins = [];
	
	/* 	
		Runs O(n)... divide the magnitude of each pixels angle to it's nearest bin
		the bins = [0,20,40,60,80,100,120,140,160]
		If we have a pixel with an angle ( direction ) of 80 degrees and magnitude of 2 it would adds 2 to the 5th bin.  
		The gradient of a the pixel with an angle of 10 degrees and magnitude of 5 is half way between 0 and 20, the vote by the pixel 
		splits evenly into the two bins, so the 1st bin would receive 2.5 and then the 2nd bin would receive 2.5 votes. 
	*/

  	//iterate over the columns 8x8
	var clip = grid.length%8;
  	for(var i = 0; i < (grid.length - clip); i+=8) {
  		//iterate over the rows 8x8
  		grid_of_bins.push(new Array())
  		for(var j = 0; j < 400; j+=8) {
  			//now iterate and calculate the indivdual tuples in the 8x8 area assigning the weight proportionally to each bin.
  			for(var k = j; k < (j + 8); k++) {
  				for(var l = i; l < (i + 8); l++) {
  					var bi = Math.floor(grid[l][k][1]/20); //bi is the bin index.
  					var ratio = (grid[l][k][1]/20 - bi);
  					bin[ bi ] += (1 - ratio)*grid[l][k][0];
  					//since we are dealing with 0deg to 180deg, catch overflow.
  					( (bi + 1) > 8) ? bin[0] += ratio*grid[l][k][0] : bin[ (bi+1) ] += ratio*grid[l][k][0];	
  				}
  			}
  		grid_of_bins[i/8].push(bin);
  		bin = [0,0,0,0,0,0,0,0,0];
  		}
  	}

	//normalize the values and create 36x1 vectors
  	var concated_bins = []; //36x1
  	var all_normal_bins = [];
  	for(var i = 0; i < grid_of_bins.length - 1; i++) {
  		for(var j = 0; j < grid_of_bins[i].length - 1; j++) {
  			var normalize = 0, k = 0;
  			while(k < 4) {
  				for(var l = 0; l < 9; l++) {
  					if(k == 0) {
  						normalize += grid_of_bins[i][j][l]*grid_of_bins[i][j][l];
  						concated_bins.push(grid_of_bins[i][j][l]);
  					}
  					else if(k == 1) {
  						normalize += grid_of_bins[i+1][j][l]*grid_of_bins[i+1][j][l];
  						concated_bins.push(grid_of_bins[i+1][j][l]);
  					}
  					else if(k == 2) {
  						normalize += grid_of_bins[i+1][j+1][l]*grid_of_bins[i+1][j+1][l];
  						concated_bins.push(grid_of_bins[i+1][j+1][l]);
  					}
  					else if(k == 3) {
  						normalize += grid_of_bins[i][j+1][l]*grid_of_bins[i][j+1][l];
  						concated_bins.push(grid_of_bins[i][j+1][l]);
  					}
  				}
  				k++;
  			}
  			for(var l = 0; l < concated_bins.length; l++)
  				concated_bins[l] = concated_bins[l]/(Math.sqrt(normalize)); 
  			all_normal_bins.push(concated_bins)
  			concated_bins = [];
  		}
  	}
	console.log(all_normal_bins);
  	return imageData;
  }

  componentRoutine() {
	var ctx = this.refs.canvas.getContext('2d');
	var img = new Image;
	img.onload = () => {
	  //draw image onto the canvas
	  this.refs.canvas.height = (400 * img.height / img.width);
	  ctx.drawImage(img, 0, 0, 400,400 * img.height / img.width);		

	  //process the image.
	  var imageData = this.processImage();
	  ctx.putImageData(imageData, 0, 0);
	}
	img.src = URL.createObjectURL(this.props.img_data);	
  }

  componentDidUpdate() {
	this.componentRoutine();
  }

  componentDidMount() {
	this.componentRoutine();
  }

  render() {
    return (
      <div className={styles.componentContainer}>
		<div className={styles.componentImageContainer}>
	  		<div className={styles.componentImageTitle}>{this.props.desc_data["title"]}</div>
	  		<canvas className={styles.componentImageContent} ref="canvas" width={400} />
        </div>
		<div className={styles.componentDescriptionContainer}>
		  <div className={styles.componentDescriptionTitle}>Description:</div> 
		  <div className={styles.componentDescriptionContent}>{this.props.desc_data["description"]}</div>
		</div>
		<div className={styles.componentLinkContainer}>
		  <div className={styles.componentLinkTitle}>Link:</div>
		  <div className={styles.componentLinkContent}><a href={this.props.desc_data["link"]} target="_blank">{this.props.desc_data["link"]}</a></div>
		</div>
		<div className={styles.componentEquationContainer}>
		  <div className={styles.componentEquationTitle}>Equation:</div>
		  <div className={styles.componentEquationContent}>{this.props.desc_data["equation"]}</div>
		</div>
      </div>
    );
  }

}
