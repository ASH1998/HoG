import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import styles from './style/style.css';

export default class ProcessedComponent extends React.Component {

  constructor(props) {
	   super(props);
    this.state = { ogdata: ''};
     this.componentRoutine = this.componentRoutine.bind(this);
     this.drawBoundingBox = this.drawBoundingBox.bind(this);
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

  drawBoundingBox() { 
    var ctx = this.refs.canvas.getContext('2d');
    var imageData = this.state.ogdata;
    var data = imageData.data;
    for(var i = 0; i < 400; i+=4) {
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + (200*1600)] = data[i + (200*1600) + 1] = data[i + (200*1600) + 2] = 255;
    }
    for(var i = 0; i < (200*1600); i+=1600) {
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 396] = data[i + 396 + 1] = data[i + 396 +2] = 255;
    }

    ctx.putImageData(imageData,0,0);

    var clip_ctx = this.refs.clip_canvas.getContext('2d');
    var clip_imageData = ctx.getImageData(0,0,100,200);
    for(var i = 0; i < 200*1600; i+=1600) {
      for(var j = 0; j < 400; j+=4) {
        clip_imageData[i + j] = data[i + j];
        clip_imageData[i + j + 1] = data[i + j + 1];
        clip_imageData[i + j + 2] = data[i + j + 2]; 
      }
    }
    clip_ctx.putImageData(clip_imageData,0,0);

  }

  componentRoutine() {
	var ctx = this.refs.canvas.getContext('2d');
	
	var img = new Image;
	img.onload = () => {

	  //draw image onto the canvas
	  this.refs.canvas.height = (400 * img.height / img.width);
	  ctx.drawImage(img, 0, 0, 400, 400 * img.height / img.width);	
    
    var imageData = ctx.getImageData(0,0,400,400*this.refs.canvas.height/this.refs.canvas.width);
    this.setState({ ogdata: imageData });
	  
    this.drawBoundingBox();

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
        <Grid fluid>
          <Row>
            <Col xs={4} sm={4} md={4} lg={4} className={styles.componentImageContainer}>
                <canvas className={styles.componentImageContent} ref="canvas" width={400} />
        	  </Col>
            <Col xs={4} sm={4} md={2} lg={2} className={styles.componentPreviewImageContainer}>
	  		        <canvas className={styles.componentImageContent} ref="clip_canvas" height={200} width={100} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}
