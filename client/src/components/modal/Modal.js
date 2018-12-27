import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {http} from '../../modules/http';
import {_, _css, set_css} from '../../modules/script';
import './Modal.css';
import Left from './Left';
import Right from './Right';

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clearComments: false
    }

    this.close_modal = this.close_modal.bind(this);
    this.show_next = this.show_next.bind(this);
  }

  close_modal(e) {
    if(e.target.className.indexOf('modal') > -1) {
        _('.comment_input').value = '';
      set_css('.modal', {display: 'none'});
      this.props.setPostIndex(0);
      this.props.setSlideIndex(0);
      this.setState({clearComments: true}, () => {
        this.setState({clearComments: false});
      });
    }
  }

  show_next(e, i) {
    var index = this.props.postIndex;
    index += i;
    if(index < 0) index = this.props.posts.length-1;
    if(index >= this.props.posts.length) index = 0;
    this.props.setPostIndex(index);
    this.props.setSlideIndex(0);
    this.setState({clearComments: true}, () => {
      this.setState({clearComments: false});
    });
  }

  render() {
    return (
      <div className='modal' id='modal' onClick={(e) => {this.close_modal(e)}}>
        <div className='modal_wrapper row'>
          <Left modal={this.props.posts[this.props.postIndex]} postIndex={this.props.postIndex} />
          <Right modal={this.props.posts[this.props.postIndex]} clearComments={this.state.clearComments} />
        </div>
        <div className='arrow left_arrow' onClick={(e) => {this.show_next(e, -1)}}>
          <i className='fa fa-chevron-left'></i>
        </div>
        <div className='arrow right_arrow' onClick={(e) => {this.show_next(e, 1)}}>
          <i className='fa fa-chevron-right'></i>
        </div>
      </div>
    )
  }
}

var mstp = state => ({
  postIndex: state.postIndex,
  posts: state.posts
});

var mdtp = dispatch => {
  return {
    setPostIndex: (postIndex) => {
      dispatch({type: 'POSTINDEX', payload: postIndex});
    },
    setSlideIndex: (slideIndex) => {
      dispatch({type: 'SLIDEINDEX', payload: slideIndex});
    }
  };
};
export default connect(mstp, mdtp)(Modal);
