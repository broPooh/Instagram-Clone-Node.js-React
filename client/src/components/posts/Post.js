import React from 'react';
import { NavLink } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, set_display} from '../../modules/script';
import './Post.css';

class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      thumb: '',
      video: '',
      likes: 0,
      comments: 0,
      dots: 1
    }

    this.open_modal = this.open_modal.bind(this);
  }

  open_modal(e) {
    set_display('.modal', 'block');
    this.props.dispatch({type: 'MODAL', payload: this.props.posts[this.props.index]});
    this.props.dispatch({type: 'SLIDEINDEX', payload: 0});
    this.props.dispatch({type: 'POSTINDEX', payload: this.props.index});
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.post) {
      this.setState({
        title: nextProps.post.title,
        thumb: nextProps.post.thumb,
        video: nextProps.post.video,
        likes: nextProps.post.likes,
        comments: nextProps.post.comments,
        dots: nextProps.post.images.length
      });
    }
  }

  render() {
    var media = '';
    if(!this.state.video) {
      media = <img src={this.state.thumb} alt={this.state.title} />;
    } else {
      media = <video src={this.state.video}></video>
    }

    var dots_wrapper = '';
    var dots = [];
    if(this.state.dots > 1) {
      for(var i=0; i<this.state.dots; i++) {
        dots.push(<div key={i} className='dot'></div>);
      }
      dots_wrapper = <div className='dots_wrapper'>{dots}</div>;
    }


    return (
      <div className='post' onClick={(e) => {this.open_modal(e)}}>
        <div className='wrapper'>
          {media}
          <div className='data'>
            <ul>
              <li>
                <div>
                  <i className='fa fa-heart'></i> {this.state.likes}
                </div>
              </li>
              <li>
                <div>
                  <i className='fa fa-comment'></i> {this.state.comments}
                </div>
              </li>
            </ul>
          </div>
          {dots_wrapper}
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  posts: state.posts
});
export default connect(mstp, null, null, {pure: false})(Post);
