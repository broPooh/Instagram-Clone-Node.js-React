import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server'
import './Left.css';

class Left extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image: '',
      index: 0,
      postIndex: 0
    }

    this.show_next_image = this.show_next_image.bind(this);
    this.fit_in_wrapper = this.fit_in_wrapper.bind(this);
  }

  show_next_image(e, i) {
    set_display('.modal .left_wrapper img', 'none');
    var index = this.state.index;
    index = index + i;
    console.log('index='+index);
    var img = _('.modal .left_wrapper img');
    var len = this.props.modal.images.length;
    if(index >= len) index = 0;
    if(index < 0) index = len-1;
    //this.fit_in_wrapper();
    this.setState({index: index, image: this.props.modal.images[index]});
    setTimeout(() => {
      set_display('.modal .left_wrapper img', 'block');
    }, 100);
  }

  fit_in_wrapper() {
    var id = '.modal .left_wrapper img';
    var img = _(id);
    set_css(id, {width: '100%', height: 'auto', opacity: 0});
    setTimeout(function() {
      var h = img.offsetHeight;
      var wh = _('.left_wrapper').offsetHeight;
      console.log(wh+'/'+h);
      if(h < wh) set_css(id, {width: 'auto', height: '100%'});
      set_css(id, {opacity: 1})
    }, 100);
  }

  componentWillReceiveProps() {
    if(this.state.postIndex != this.props.postIndex) {
      this.setState({postIndex: this.props.postIndex, index: 0});
    }
  }

  render() {
    var media = '';
    var left = '';
    var right = '';
    var dots = [];
    if(this.props.modal !== undefined) {
      if(!this.props.modal.video) {
        var images = this.props.modal.images;
        media = <img className='image' src={images[this.state.index]} />;
        // set dots by images
        if(images.length > 1) {
          for(var i=0; i<images.length; i++) {
            if(i == this.state.index) dots.push(<div key={i} className='dot active'></div>);
            else dots.push(<div key={i} className='dot'></div>);
          }

          // set left slide button
          if(this.state.index > 0) {
            left = (
              <div className='left_button button' onClick={(e) => {this.show_next_image(e, -1)}}>
                <i className='fa fa-arrow-circle-left'></i>
              </div>
            );
          }

          // set right slide button
          if(this.state.index < images.length-1) {
            right = (
              <div className='right_button button' onClick={(e) => {this.show_next_image(e, 1)}}>
                <i className='fa fa-arrow-circle-right'></i>
              </div>
            );
          }
        }
      } else {
        media = <video src={this.props.modal.video} controls></video>;
      }
    }

    return (
      <div className='left_wrapper'>
        {media}
        {left}
        {right}
        <div className='dots'>
          {dots}
        </div>
      </div>
    )
  }
}

var mstp = state => ({
  posts: state.posts
});
export default connect(mstp)(Left);
