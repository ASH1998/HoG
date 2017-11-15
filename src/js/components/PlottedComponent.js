/* Depreciated for now */

import React from "react";
import styles from './style/style.css';

export default class PlottedComponent extends React.Component {

  constructor(props) {
	super(props);
    this.drawGraph = this.drawGraph.bind(this);
  }

  drawGraph() {
    var ctx = this.refs.plot.getContext('2d');
    ctx.strokeStyle="#CAA6A9";
    var grid_size = 600;
    for(var i=0;i<this.props.bins.length;i++) {
    	for(var j=0;j<this.props.bins[i].length;j++) {
			var adj_mag = ( (this.props.bins[i][j]*grid_size) );
		    var dx = adj_mag*Math.cos((i*j)*1/21);
		    var dy = adj_mag*Math.sin((i*j)*1/21);
		    ctx.moveTo(dx, grid_size-dy);
		    ctx.lineTo(dx+1, grid_size-dy+1);
		    ctx.stroke();
    	}
    }
  }

  componentDidUpdate() {  
  	this.drawGraph();  
  }

  shouldComponentUpdate(nextProps, nextState) {
  	if(this.props.bins != nextProps.bins) {
  		return true;
  	}
  	return false;
  }

  componentDidMount() {
  	this.drawGraph();
  }

  render() { 
    return (
      <div>
        <canvas ref="plot" className={styles.canvasPlot} height={600} width={600} />
      </div>
    );
  }

}
