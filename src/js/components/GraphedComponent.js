import React from "react";
import styles from './style/style.css';

export default class GraphedComponent extends React.Component {

  constructor(props) {
	super(props);
	  this.state = {
      bins: {} 
    };	
    this.HoGGraph = this.HoGGraph.bind(this);
    this.displayGraph = this.displayGraph.bind(this);
    this.initGraph = this.initGraph.bind(this);
    this.drawGraph = this.drawGraph.bind(this);
  }

  HoGGraph() {
    //get the pixel data off of the canvas
  var imageData = this.props.img_data;
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

    //iterate over the columns 8x8
    for(var i = 0; i < grid.length; i+=8) {
      //iterate over the rows 8x8
      grid_of_bins.push(new Array())
      for(var j = 0; j < w; j+=8) {
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
    this.setState({bins: grid_of_bins});

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
  }

  initGraph() {
    //clear the graph and draw bounding deg lines//
    var ctx = this.refs.graph.getContext('2d');
    ctx.clearRect(0, 0, this.refs.graph.width, this.refs.graph.height);
    ctx.fillStyle="#000";
    ctx.fillRect(0, 300, 720, 5);
    ctx.font = "16px Arial";
    ctx.fillText("0",0,320);
    ctx.fillRect(40, 300, 2.5, 10);   //0
    ctx.fillText("20",70,320);
    ctx.fillRect(120, 300, 2.5, 10);  //20
    ctx.fillText("40",150,320);
    ctx.fillRect(200, 300, 2.5, 10);  //40
    ctx.fillText("60",230,320);
    ctx.fillRect(280, 300, 2.5, 10);  //60
    ctx.fillText("80",310,320);
    ctx.fillRect(360, 300, 2.5, 10);  //80
    ctx.fillText("100",385,320);
    ctx.fillRect(440, 300, 2.5, 10);  //100
    ctx.fillText("120",465,320);
    ctx.fillRect(520, 300, 2.5, 10);  //120
    ctx.fillText("140",545,320);
    ctx.fillRect(600, 300, 2.5, 10);  //140
    ctx.fillText("160",625,320);
    ctx.fillRect(680, 300, 2.5, 10);  //160
    ctx.fillText("180",690,320);
  }

  drawGraph(i,j) {
    var ctx = this.refs.graph.getContext('2d');
  
    //determine the max factor needed to scale the graph onto the canvas//
    var mf = 1;  
    for(var k=0; k<this.state.bins[i][j].length; k++) {
      var h = this.state.bins[i][j][k];
      var f = 1; 
      while(  (h/f) >= 300) { (f > mf) ? mf = f : f; f++;}
    }

    if(mf > 1) {
      this.setState({scale: "*scaled " + mf + " times*"})
    }
    else 
      this.setState({scale: " "});

    //if k == 0 then graph 0deg and 180deg, else graph within bounds
    ctx.fillStyle="#CAA6A9";
    for(var k=0; k<this.state.bins[i][j].length; k++) {
      var h = this.state.bins[i][j][k]; 
      if(k == 0) {
        ctx.fillRect( 0, 300-(h/mf), 40, (h/mf) );
        ctx.strokeRect(0, 300-(h/mf) , 40, (h/mf) );
        ctx.fillRect(680, 300-(h/mf), 40, (h/mf) );
        ctx.strokeRect(680, 300-(h/mf), 40, (h/mf) );
      } 
      else {
        ctx.fillRect( ((k*80)-40), 300-(h/mf), 80, (h/mf) ); 
        ctx.strokeRect( ((k*80)-40), 300-(h/mf), 80, (h/mf) ); 
      }
    }
  }

  displayGraph(e) {
    var loc = e.target.options[e.target.selectedIndex].text
    var loc = loc.split(" ");
    var i = loc[1][0]-1;
    var j = loc[2][0]-1;
    this.initGraph();
    this.drawGraph(i,j);

  }

  componentDidUpdate() {
  }

  componentDidMount() {
    new Promise((resolve, reject) => {
      this.HoGGraph();
      resolve();
    }).then((result) => {
      return this.initGraph();
    }).then((result) => {
      return this.drawGraph(0,0);
    });
  }

  render() { 
    var loc =  [];
    for(var i=0;i<16;i++) { 
      for(var j=0;j<8;j++) {
        loc.push([i,j]);
      }
    }
    var graphList = loc.map(function(b,i){
      if(b[0]==0 && b[1]==0) 
        return <option defaultValue key={b}>Bin {b[0]+1}/16 {b[1]+1}/8 </option>;
      else
        return <option key={b}>Bin {b[0]+1}/16 {b[1]+1}/8 </option>;
    })
    return (
      <div>
        <select ref="selection" onChange={(e) => this.displayGraph(e)}>{graphList}</select>
        <span style={{float:'right',margin:'0px 15px 0px 0px',fontStyle:'italic'}}> {this.state.scale} </span>
        <canvas ref="graph" className={styles.canvasGraph} height={350} width={720} />
      </div>
    );
  }

}
