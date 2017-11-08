import React from "react";
import styles from './style/style.css';

export default class PlottedComponent extends React.Component {

  constructor(props) {
	super(props);
	  this.state = {
      normal_bins: {} 
    };	
    this.displayGraph = this.displayGraph.bind(this);
    this.initGraph = this.initGraph.bind(this);
    this.drawGraph = this.drawGraph.bind(this);
  }

  initGraph() {
    /*
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
    */
  }

  drawGraph(i,j) {
    /*
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
    */
  }

  displayGraph(e) {

  }

  componentDidUpdate() {
  }

  componentDidMount() {
    new Promise((resolve, reject) => {
      resolve();
    }).then((result) => {
      return this.initGraph();
    }).then((result) => {
      return this.drawGraph(0,0);
    });
  }

  render() { 
    return (
      <div>
        <canvas ref="plot" className={styles.canvasPlot} height={350} width={720} />
      </div>
    );
  }

}
