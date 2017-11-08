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
    this.setState({bins: this.props.grid_of_bins});

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
    return (
      <div>
        <canvas ref="plot" className={styles.canvasPlot} height={350} width={720} />
      </div>
    );
  }

}
