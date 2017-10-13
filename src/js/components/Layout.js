import React from "react";
import styles from './style/style.css';
import ProcessedComponent from "./ProcessedComponent.js";

export default class Layout extends React.Component {

  constructor(props) {
	super(props);
	 this.state = {file: '',imagePreviewUrl: ''};	
  }

  handleChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
	     file: file,
	     imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file);
  }

  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (
    		<div>
    	    <ProcessedComponent img_data={this.state.file} />
    		</div>
	    );
    }
    return (
      <div>
        <div className={styles.mainTitle}>HoG-SVM-OR</div>
		    <input className={styles.mainInput} type="file" onChange={(e)=>this.handleChange(e)} />
		    {$imagePreview}
      </div>
    );
  }

}
