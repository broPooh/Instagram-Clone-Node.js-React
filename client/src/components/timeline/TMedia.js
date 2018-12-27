import React from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './TMedia.css';

class TMedia extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      image: '',
      index: 0
    }

    this.show_next_image = this.show_next_image.bind(this);
  }

  show_next_image(e, i) {
    set_display('.tPost .images img', 'none');
    var index = this.state.index;
    index = index + i;
    console.log('index='+index);
    var img = _('.modal .left_wrapper img');
    var len = this.props.post.images.length;
    if(index >= len) index = 0;
    if(index < 0) index = len-1;
    this.setState({index: index, image: this.props.post.images[index]});
    setTimeout(() => {
      set_display('.tPost .images img', 'block');
    }, 100);
  }

  componentDidMount() {
    if(!this.props.post.video) this.setState({image: this.props.post.images[0]});
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';
    var media = '';
    if(!this.props.post.video) {
      media = <img src={this.state.image} alt={this.props.post.title} />;
    } else {
      media = <video src={this.props.post.video} controls></video>
    }

    // set dots by images
    var dots = [];
    var left = '';
    var right = '';
    var images = this.props.post.images;
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

    return (
      <div className='row images'>
        <div className='wrapper'>
          {media}
          {left}
          {right}
        </div>
        <div className='dots_wrapper'>
          <div className='dots'>
            {dots}
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  _: state._
});

var mdtp = dispatch => {
  return {
    set_: (_) => {
      dispatch({type: '', payload: _});
    }
  };
};

//export default connect(mstp, mdtp)(_);
export default TMedia;
