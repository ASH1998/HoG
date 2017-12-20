import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import styles from './style/style.css';
import GraphedComponent from './GraphedComponent.js';

export default class ProcessedComponent extends React.Component {

  constructor(props) {
	   super(props);
     this.state = { 
      train: false,
      clip_imageData: {},
      ogdata: '',

      boxBoundaries: {
        left: 0,
        right: 100,
        top: 0,
        bottom: 200 },

      moveable: {
        isMoveable: false,
        x: 0,
        y: 0 },

      bins: {}, //store 16x8 bins of [0,20,40,60,80,100,120,140,160]

      normal_bins: {}, //store 16x8 bins (normalized)

      signature_bins: {}, //store 16 1x36 vectors (normalized)

      base: true,

      signature: ""

     };

     this.componentRoutine = this.componentRoutine.bind(this);

     this.initComponentRoutine = this.initComponentRoutine.bind(this);

     this.train = this.train.bind(this); //Calls the HoG function and stores data in ProcessedComponent's state

     //mouse events to pick new location of sample space
     this.drawBoundingBox = this.drawBoundingBox.bind(this);
     this.moveBoundingBox = this.moveBoundingBox.bind(this);
     this.dragBoundingBox = this.dragBoundingBox.bind(this);
     this.dropBoundingBox = this.dropBoundingBox.bind(this);

     this.visualizeGradients = this.visualizeGradients.bind(this);

  }

  moveBoundingBox(event) {
    if(this.state.moveable.isMoveable) {

      //determine distance mouse traveled
      var dx = event.nativeEvent.layerX - this.state.moveable.x;
      var dy = event.nativeEvent.layerY - this.state.moveable.y;

      //redraw bouding box
      this.drawBoundingBox(dx,dy);
    }
  } 

  dragBoundingBox(event) {
    //if the mouse clicks within the bounding box prepare to move bounding box by updating moveable
    if(   
          event.nativeEvent.layerX > this.state.boxBoundaries.left &&
          event.nativeEvent.layerX < this.state.boxBoundaries.right &&
          event.nativeEvent.layerY > this.state.boxBoundaries.top &&
          event.nativeEvent.layerY < this.state.boxBoundaries.bottom
    ) {
      var moveableUpdate = {isMoveable: true, x: event.nativeEvent.layerX, y: event.nativeEvent.layerY};
      this.setState({moveable: moveableUpdate, train: false });
    }
  }

  dropBoundingBox(event) { 
    if(this.state.moveable.isMoveable) {

      //determine distance mouse traveled
      var dx = event.nativeEvent.layerX - this.state.moveable.x;
      var dy = event.nativeEvent.layerY - this.state.moveable.y;

      //reset moveable
      var moveableUpdate = {isMoveable: false, x: 0, y: 0};
      this.setState({moveable: moveableUpdate})

      //update bounding box
      var boxBoundariesUpdate = {
        left: (this.state.boxBoundaries.left+dx),
        right: (this.state.boxBoundaries.right+dx),
        top: (this.state.boxBoundaries.top+dy),
        bottom: (this.state.boxBoundaries.bottom+dy)
      }
      this.setState({boxBoundaries: boxBoundariesUpdate});   
    }
  }

  initDrawBoundingBox(dx,dy) { 
    var ctx = this.refs.canvas.getContext('2d');

    //repaint original image on canvas
    ctx.putImageData(this.state.ogdata,0,0);

    //check boundary conditions for boundary box//
    if( this.state.boxBoundaries.left + dx < 0 )
      dx = 0 - this.state.boxBoundaries.left;
    if( this.state.boxBoundaries.right + dx > 400 )
      dx = 400 - this.state.boxBoundaries.right;
    if( this.state.boxBoundaries.top + dy < 0 )
      dy = 0 - this.state.boxBoundaries.top;
    if ( this.state.boxBoundaries.bottom + dy > this.refs.canvas.height )
      dy = this.refs.canvas.height - this.state.boxBoundaries.bottom;

    var data = this.state.ogdata.data;
    var clip_ctx = this.refs.clip_canvas.getContext('2d');
    var clip_imageData = ctx.getImageData(this.state.boxBoundaries.left+dx,this.state.boxBoundaries.top+dy,this.state.boxBoundaries.right+dx,this.state.boxBoundaries.bottom+dy);

    //draw zoomed, clipped, image
    for(var i = (dy*1600); i < (200*1600 + dy*1600); i+=1600) {
      for(var j = (dx*4); j < (400 + dx*4); j+=4) {
        clip_imageData[i + j] = data[i + j];
        clip_imageData[i + j + 1] = data[i + j + 1];
        clip_imageData[i + j + 2] = data[i + j + 2]; 
      }
    }
    clip_ctx.putImageData(clip_imageData,0,0);
      
    //draw bounding box on original image showing area of clipped image
    ctx.beginPath();
    ctx.moveTo(this.state.boxBoundaries.left+dx, this.state.boxBoundaries.top+dy);
    ctx.lineTo(this.state.boxBoundaries.left+dx, this.state.boxBoundaries.bottom+dy);
    ctx.lineTo(this.state.boxBoundaries.right+dx, this.state.boxBoundaries.bottom+dy);
    ctx.lineTo(this.state.boxBoundaries.right+dx, this.state.boxBoundaries.top+dy);
    ctx.lineTo(this.state.boxBoundaries.left+dx, this.state.boxBoundaries.top+dy);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

  }


  drawBoundingBox(dx,dy) { 
    var ctx = this.refs.canvas.getContext('2d');

    //repaint original image on canvas
    ctx.putImageData(this.state.ogdata,0,0);
   
      //check boundary conditions for boundary box//
      if( this.state.boxBoundaries.left + dx < 0 )
        dx = 0 - this.state.boxBoundaries.left;
      if( this.state.boxBoundaries.right + dx > 400 )
        dx = 400 - this.state.boxBoundaries.right;
      if( this.state.boxBoundaries.top + dy < 0 )
        dy = 0 - this.state.boxBoundaries.top;
      if ( this.state.boxBoundaries.bottom + dy > this.refs.canvas.height )
        dy = this.refs.canvas.height - this.state.boxBoundaries.bottom;

      if(this.state.moveable.isMoveable) {
        var data = this.state.ogdata.data;
        var clip_ctx = this.refs.clip_canvas.getContext('2d');
        var clip_imageData = ctx.getImageData(this.state.boxBoundaries.left+dx,this.state.boxBoundaries.top+dy,this.state.boxBoundaries.right+dx,this.state.boxBoundaries.bottom+dy);

        //draw zoomed, clipped, image
        for(var i = (dy*1600); i < (200*1600 + dy*1600); i+=1600) {
          for(var j = (dx*4); j < (400 + dx*4); j+=4) {
            clip_imageData[i + j] = data[i + j];
            clip_imageData[i + j + 1] = data[i + j + 1];
            clip_imageData[i + j + 2] = data[i + j + 2]; 
          }
        }
        clip_ctx.putImageData(clip_imageData,0,0);
      }
    

    //draw bounding box on original image showing area of clipped image
    ctx.beginPath();
    ctx.moveTo(this.state.boxBoundaries.left+dx, this.state.boxBoundaries.top+dy);
    ctx.lineTo(this.state.boxBoundaries.left+dx, this.state.boxBoundaries.bottom+dy);
    ctx.lineTo(this.state.boxBoundaries.right+dx, this.state.boxBoundaries.bottom+dy);
    ctx.lineTo(this.state.boxBoundaries.right+dx, this.state.boxBoundaries.top+dy);
    ctx.lineTo(this.state.boxBoundaries.left+dx, this.state.boxBoundaries.top+dy);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

  }

  HoG() {
    //get the pixel data off of the canvas
    var imageData = this.state.clip_imageData;
    var data = imageData.data;
    var h = imageData.height;
    var w = imageData.width;
    var tempData = new Uint8ClampedArray(data);

    for(var i = 0; i < data.length; i += 4) {
      var shade = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      tempData[i] = tempData[i + 1] = tempData[i + 2] = shade;
    } 

    /* calculate magnitude of gradients (and angle) */
    var grid = [], arr_of_tuples = [];
    for(var i = 0; i < h; i++) { 
        for(var j = 0; j < w*4; j+=4 ) {
          var curIndex = (i*(w*4) + j), gradX = 0, gradY = 0, angle = 0, magnitude = 0;
          if(j!=0 && j!=(w*4-4)) //avoid edges
            gradX = tempData[curIndex + 4] - tempData[curIndex - 4];
          if(i!=0 && i!=(h-1) ) //avoid edges
            gradY = tempData[curIndex - (w*4)] - tempData[curIndex + (w*4)];
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
      Binify the tuples: divide the magnitude of each pixel's angle to it's nearest bin.
      bins = [0,20,40,60,80,100,120,140,160] (deg)
      If we have a pixel with an angle of 80 degrees and magnitude of 2, then we would add 2 to the 5th bin.  
      The gradient of a pixel with an angle of 10 degrees and a magnitude of 5 is half way between 0 and 20 degrees, 
      the vote by the pixel would then be split evenly into the two bins. The 1st bin at 0 would receive 2.5 votes
      and then the 2nd bin at 20 would receive the other 2.5 votes. 
    */

    //iterate over the 8x8 cells
    for(var i = 0; i < grid.length; i+=8) {
      //iterate over the rows 8x8
      grid_of_bins.push(new Array())
      for(var j = 0; j < w; j+=8) {
        //now iterate and calculate the indivdual tuples in the 8x8 area assigning the weight proportionally to each bin.
        for(var k = j; k < (j + 8); k++) {
          for(var l = i; l < (i + 8); l++) {
            var bi = Math.floor(grid[l][k][1]/20); //bi is bin index.
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

    this.setState({bins: grid_of_bins});

    //make a clone of the grid_of_bins. These values will later be nomralized and then visualized on the sample space.
    var grid_of_normal_bins = grid_of_bins.map(function(arr) {
      return arr.map(function(bin)  {
        return bin.slice();
      });
    });

    //normalize the 8x8 cells
    for(var i=0;i<grid_of_normal_bins.length;i++) {
      for(var j=0;j<grid_of_normal_bins[i].length;j++) {
        var normalize = 0;
        for(var k=0;k<grid_of_normal_bins[i][j].length;k++)
          normalize += grid_of_normal_bins[i][j][k]*grid_of_normal_bins[i][j][k];
        for(var k=0;k<grid_of_normal_bins[i][j].length;k++) {
          grid_of_normal_bins[i][j][k] = grid_of_normal_bins[i][j][k]/(Math.sqrt(normalize));
        }
      }
    }

    this.setState({normal_bins: grid_of_normal_bins});

    //normalize the values and create 36x1 vectors
    var concated_bins = []; //36x1
    var all_signature_bins = [];
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
        all_signature_bins.push(concated_bins)
        concated_bins = [];
      }
    }
    this.setState({signature_bins: all_signature_bins});
  }

  visualizeGradients() { 
    var ctx = this.refs.clip_canvas.getContext('2d');
    ctx.strokeStyle="#000000";    
    ctx.beginPath();
    var grid_size = 12.5;

    for(var i=grid_size; i<this.refs.clip_canvas.width;i=i+grid_size) {
      ctx.moveTo(i,0);
      ctx.lineTo(i, 200);
    } 
    for(var i=grid_size; i<this.refs.clip_canvas.height;i=i+grid_size) {
      ctx.moveTo(0,i);
      ctx.lineTo(100,i);
    }
    ctx.stroke();

    ctx.strokeStyle="#FF0000";    
    ctx.beginPath();
    for(var i=0; i<this.state.normal_bins.length; i++) {
      for(var j=0; j<this.state.normal_bins[i].length; j++) {    
        //get center of bin
        var x = j*grid_size;
        var y = i*grid_size;
        for(var k=0;k<this.state.normal_bins[i][j].length; k++) {
          //determine magnitude and direction of gradient
          var adj_mag = ( (this.state.normal_bins[i][j][k]*grid_size)/2 );
          var dx = adj_mag*Math.cos(k*20);
          var dy = adj_mag*Math.sin(k*20);
          //paint the gradient in the 8x8 cell
          ctx.moveTo( x+(grid_size/2), y+(grid_size/2) );
          ctx.lineTo( x+(grid_size/2)+dx, y+(grid_size/2)+dy );
          ctx.lineTo( x+(grid_size/2)+(-dx), y+(grid_size/2)+(-dy) );
        }
      }
    }
    ctx.stroke()

  }

  train(e) {
    e.preventDefault();
    var dest_canvas = document.createElement("canvas");
    dest_canvas.height = 128;
    dest_canvas.width = 64;
    var destCtx = dest_canvas.getContext('2d');
    destCtx.scale(0.64, 0.64);
    destCtx.drawImage(this.refs.clip_canvas,0,0);    
    new Promise((resolve, reject) => {
        this.setState({train: true,clip_imageData: destCtx.getImageData(0,0,64,128)});
        resolve();
      }).then((result) => {
        this.HoG();
        this.printSignature();
        this.setState({train: false})
    }).then((result) => {
        this.visualizeGradients();
    })
  }

  componentRoutine() {
  	var ctx = this.refs.canvas.getContext('2d');
  	
  	var img = new Image;
  	//when the compount mounts draw image onto the canvas
    img.onload = () => {

      //get width and heigh (sized accordingly)
      var w = this.refs.canvas.width;
      var h = this.refs.canvas.height = (400 * img.height / img.width);

      //draw image and draw a bounding, preview, box
      ctx.drawImage(img, 0, 0, w, h);	
      var imageData = ctx.getImageData(0, 0, w, h);
      this.setState({ ogdata: imageData });
      this.drawBoundingBox(0,0);
    }
    
    img.src = URL.createObjectURL(this.props.img_data);	

  }

    initComponentRoutine() {
    var ctx = this.refs.canvas.getContext('2d');
    
    var img = new Image;
    //when the compount mounts draw image onto the canvas
    img.onload = () => {

      //get width and heigh (sized accordingly)
      var w = this.refs.canvas.width;
      var h = this.refs.canvas.height = (400 * img.height / img.width);

      //draw image and draw a bounding, preview, box
      ctx.drawImage(img, 0, 0, w, h); 
      var imageData = ctx.getImageData(0, 0, w, h);
      this.setState({ ogdata: imageData });
      this.initDrawBoundingBox(0,0);
    }
    
    img.src = URL.createObjectURL(this.props.img_data); 

  }

  componentDidUpdate(prevProps, prevState) {
    this.componentRoutine();   
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.img_data.name != nextProps.img_data.name){
      return true;
    }
    if( nextState.train ) {
      this.setState({base: false});
      return true;
    }
    if ( nextState.moveable.isMoveable && !this.state.base ) {
      this.setState({base: true});
      return true;
    }
    return false;
  }

  printSignature() {
    var sig = "<div>"
    for(var i=0;i<this.state.signature_bins.length;i++) {
      for(var j=0;j<this.state.signature_bins[i].length;j++) {
          sig += this.state.signature_bins[i][j] + ", "       
      }
    }
    sig+= "</div>"
    this.setState({signature: sig})
  }

  componentDidMount() {
	  this.initComponentRoutine();
  }

  render() {    
    let graphTrainedComponent = this.state.train;
    let $graphPreview = null;
      
    if (graphTrainedComponent) {
      $graphPreview = (
        <Col xs={8} sm={4} md={4} lg={4} className={styles.graphContainer}>
          <div>
            <GraphedComponent bins={this.state.bins} />
          </div>
        </Col>
      );
    }
    return (
      <div className={styles.componentContainer}>  
        <Grid fluid>
          <Row>
            <Col xs={8} sm={4} md={4} lg={3} className={styles.imageContainer}>
              <canvas className={styles.imageContent} onMouseDown={this.dragBoundingBox} onTouchStart={this.dragBoundningBox} onMouseMove={this.moveBoundingBox} onTouchMove={this.moveBoundingBox} onMouseUp={this.dropBoundingBox} onTouchEnd={this.dropBoundingBox} ref="canvas" width={400} />
      	      <div  className={styles.format}>
                <div className={styles.format}>
        	        <button onClick={(e)=>this.train(e)} style={{position:'absolute', top: '85px', left: '400px', border: '2px solid #fff'}} > Train </button>
        	      </div>
              {/*  <div className={styles.format}>
                  <select>
                    <option>yes</option>
                    <option>no</option>
                  </select>
                </div>
        	      <div className={styles.format}>
                  <button>Test</button>
                </div>
              */}
              </div>
            </Col>
            <Col xs={4} sm={3} md={2} lg={1} className={styles.previewImageContainer}>
        	    <canvas className={styles.previewImageContent} ref="clip_canvas" height={200} width={100} />
            </Col>
          </Row>  
          <Row>
            <span>
              {$graphPreview}
            </span>
          </Row>          
        </Grid>
        <div style={{color: "#fff"}}> <span dangerouslySetInnerHTML={{__html: this.state.signature}} /> </div>
      </div>
    );
  }
}
