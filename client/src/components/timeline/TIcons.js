import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, show, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import './TIcons.css';

import Posts from '../posts/Posts';

class TimelineIcons extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      liked: this.props.post.liked,
      saved: this.props.post.bookmarked
    }

    this.click_heart = this.click_heart.bind(this);
    this.click_balloon = this.click_balloon.bind(this);
    this.click_trash = this.click_trash.bind(this);
    this.click_bookmark = this.click_bookmark.bind(this);
    this.remove_post = this.remove_post.bind(this);
  }

  click_heart() {
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/likes/post', {postId: this.props.post._id})
      .then((res) => {
        console.log('/likes/post='+JSON.stringify(res.data));
        if(res.data.success) {
          this.setState({liked: res.data.liked}, () => {
            var posts = this.props.posts;
            posts[this.props.index].likes = res.data.postLikes;
            posts[this.props.index].liked = res.data.liked;
            this.props.setPosts(posts);
            if(this.props.account.username == this.props.user.username) {
              this.props.setAccount({...this.props.account, likes: res.data.userLikes});
            }
          });
        }
      });
    }
  }

  click_balloon() {
    if (!this.props.loggedIn) {
      this.setState({redirect: '/login'});
    } else {
      this.props.input.current.focus();
    }
  }

  click_trash(e) {
    if (!this.props.loggedIn) {
      this.setState({redirect: '/login'});
    } else {
      var dialog = {
        message: 'Remove this post?',
        cancel: 'Cancel',
        ok: 'OK',
        action: this.remove_post
      }
      this.props.setDialog(dialog);
      set_display('.dialog', 'block');
    }
  }

  click_bookmark() {
    if (!this.props.loggedIn) {
      this.setState({redirect: '/login'});
    } else {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/bookmarks/post', {postId: this.props.post._id})
      .then((res) => {
        console.log('/bookmarks/post='+JSON.stringify(res.data));
        if(res.data.success) {
          this.setState({saved: res.data.bookmarked}, () => {
            var posts = this.props.posts;
            posts[this.props.index].bookmarks = res.data.postBookmarks;
            posts[this.props.index].bookmarked = res.data.bookmarked;
            this.props.setPosts(posts);
            if(this.props.account.username == this.props.user.username) {
              this.props.setAccount({...this.props.account, bookmarks: res.data.userBookmarks});
            }
          });
        }
      });
    }

  }

  remove_post() {
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/posts/remove', {postId: this.props.post._id})
    .then((res) => {
      if(!res.data.success) {

      } else {
        set_display('.modal', 'none');
        //this.setState({redirect: '/posts?user='+this.props.username});
        this.props.setPosts({});
      }
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    return (
      <div className='row icons'>
        {redirect}
        <ul>
          <li className='left heart' onClick={(e) => {this.click_heart(e)}}>
            <i className={'fa fa-heart-o ' + (this.state.liked ? 'active' : '')}></i>
          </li>
          <li className='left balloon' onClick={(e) => {this.click_balloon(e)}}><i className='fa fa-comment-o'></i></li>
          <li className='right trash' onClick={(e) => {this.click_trash(e)}}><i className='fa fa-trash-o'></i></li>
          <li className='right bookmark' onClick={(e) => {this.click_bookmark(e)}}>
            <i className={'fa fa-bookmark-o ' + (this.state.saved ? 'active' : '')}></i>
          </li>
        </ul>
      </div>
    )
  }
}

var mstp = state => ({
  username: state.username,
  loggedIn: state.loggedIn,
  account: state.account,
  user: state.user,
  posts: state.posts,
  postIndex: state.postIndex
});

var mdtp = dispatch => {
  return {
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    },
    setUser: (user) => {
      dispatch({type: 'USER', payload: user});
    },
    setPosts: (posts) => {
      dispatch({type: 'POSTS', payload: posts});
    },
    setDialog: (dialog) => {
      dispatch({type: 'DIALOG', payload: dialog});
    },
    setMode: (mode) => {
      dispatch({type: 'MODE', payload: mode});
    }
  };
};
export default connect(mstp, mdtp)(TimelineIcons);
