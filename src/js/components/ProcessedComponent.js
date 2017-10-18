import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import styles from './style/style.css';

export default class ProcessedComponent extends React.Component {

  constructor(props) {
	   super(props);
     this.state = { 
      ogdata: '',

      boxBoundaries: {
        left: 0,
        right: 100,
        top: 0,
        bottom: 200 },

      moveable: {
        isMoveable: false,
        x: 0,
        y: 0 }

     };

     this.componentRoutine = this.componentRoutine.bind(this);
     this.drawBoundingBox = this.drawBoundingBox.bind(this);
     
     //mouse events to pick new location of sample space
     this.moveBoundingBox = this.moveBoundingBox.bind(this);
     this.dragBoundingBox = this.dragBoundingBox.bind(this);
     this.dropBoundingBox = this.dropBoundingBox.bind(this);
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
      this.setState({moveable: moveableUpdate });
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

  componentDidUpdate() {
  }

  componentDidMount() {
	  this.componentRoutine();
  }

  render() {
    return (
      <div className={styles.componentContainer}>  
        <Grid fluid>
          <Row>
            <Col xs={12} sm={4} md={4} lg={4} className={styles.imageContainer}>
                <canvas onMouseDown={this.dragBoundingBox} onTouchStart={this.dragBoundningBox} onMouseMove={this.moveBoundingBox} onTouchMove={this.moveBoundingBox} onMouseUp={this.dropBoundingBox} onTouchEnd={this.dropBoundingBox} onMouseLeave={this.dropBoundingBox} className={styles.imageContent} ref="canvas" width={400} />
        	  </Col>
            <Col xs={12} sm={3} md={3} lg={3}>
              <div className={styles.previewImageContainer}>
	  		        <canvas className={styles.previewImageContent} ref="clip_canvas" height={200} width={100} />
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
