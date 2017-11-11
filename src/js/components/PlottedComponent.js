import React from "react";
import styles from './style/style.css';

export default class PlottedComponent extends React.Component {

  constructor(props) {
	super(props);
    this.displayGraph = this.displayGraph.bind(this);
    this.initGraph = this.initGraph.bind(this);
    this.drawGraph = this.drawGraph.bind(this);
  }

  initGraph() {
    //clear the graph and draw 105 horizontal lines on the Y-axis
    var ctx = this.refs.plot.getContext('2d');

    ctx.putImageData(this.props.clip_imageData,0,0);    

  }

  drawGraph() {
    var ctx = this.refs.plot.getContext('2d');
    ctx.fillStyle="#CAA6A9";


  }

  displayGraph(e) {

  }

  componentDidUpdate() {    
    new Promise((resolve, reject) => {
      this.initGraph();
      resolve();
    }).then((result) => {
      this.drawGraph();
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(Object.keys(nextProps.normal_bins).length === 0 && nextProps.normal_bins.constructor === Object) {
      console.log('false')
      return false;
    }
    return true;
  }

  componentDidMount() {
  }

  render() { 
    return (
      <div>
        <canvas ref="plot" className={styles.canvasPlot} height={256} width={128} />
      </div>
    );
  }

}
