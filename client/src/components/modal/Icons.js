import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, show, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import './Icons.css';

import Posts from '../posts/Posts';

class Icons extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      modal: {},
      liked: false,
      bookmarked: false
    }

    this.click_heart = this.click_heart.bind(this);
    this.click_balloon = this.click_balloon.bind(this);
    this.click_trash = this.click_trash.bind(this);
    this.click_bookmark = this.click_bookmark.bind(this);
    this.remove_post = this.remove_post.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // get liked or not
    if(nextProps.modal) {
      this.setState({modal: nextProps.modal}, () => {
        this.setState({liked: this.props.modal.liked, bookmarked: this.props.modal.bookmarked});
      });
    }
  }

  click_heart() {
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/likes/post', {postId: this.state.modal._id})
      .then((res) => {
        console.log('/likes/post='+JSON.stringify(res.data));
        if(res.data.success) {
          this.setState({liked: res.data.liked}, () => {
            // update posts
            var posts = this.props.posts;
            if(this.props.postIndex || this.props.postIndex === 0) {
              posts[this.props.postIndex].liked = res.data.liked;
              posts[this.props.postIndex].likes = res.data.postLikes;
            }
            // remove unliked post from liked posts in account
            if(!res.data.liked && this.props.account.username == this.props.user.username && this.props.mode === 'likes') {
              var newPosts = [];
              for(var i=0; i<posts.length; i++) {
                if(posts[i]._id !== res.data.unlikedId) {
                  newPosts.push(posts[i]);
                }
              }
              this.props.setPosts(newPosts);
            } else {
              this.props.setPosts(posts);
            }

            // update user and account
            if(this.props.account.username == this.props.user.username) {
              this.props.setUser({...this.props.user, likes: res.data.userLikes});
              this.props.setAccount({...this.props.account, likes: res.data.userLikes});
            }
          });
        }
      });
    }
  }

  click_balloon() {
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      _('.comment_input').focus();
    }
  }

  click_trash(e) {
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      var dialog = {
        message: 'Remove this post?',
        cancel: 'Cancel',
        ok: 'Remove',
        action: this.remove_post
      }
      this.props.setDialog(dialog);
      set_display('.dialog', 'block');
    }
  }

  click_bookmark() {
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/bookmarks/post', {postId: this.state.modal._id})
      .then((res) => {
        console.log('/bookmarks/post='+JSON.stringify(res.data));
        if(res.data.success) {
          // update heart color
          this.setState({saved: res.data.bookmarked}, () => {
            // update posts
            var posts = this.props.posts;
            if(this.props.postIndex || this.props.postIndex === 0) {
              posts[this.props.postIndex].bookmarked = res.data.bookmarked;
              posts[this.props.postIndex].bookmarks = res.data.postBookmarks;
            }
            // remove unliked post from liked posts in account
            if(!res.data.bookmarked &&
              this.props.account.username == this.props.user.username &&
              this.props.mode === 'saved') {
              var newPosts = [];
              for(var i=0; i<posts.length; i++) {
                if(posts[i]._id !== res.data.unbookmarkedId) {
                  newPosts.push(posts[i]);
                }
              }
              this.props.setPosts(newPosts);
            } else {
              this.props.setPosts(posts);
            }

            // update user and account
            if(this.props.account.username == this.props.user.username) {
              this.props.setUser({...this.props.user, bookmarks: res.data.userBookmarks});
              this.props.setAccount({...this.props.account, bookmarks: res.data.userBookmarks});
            }
          });
        }
      });
    }

  }

  remove_post() {
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/posts/remove', {postId: this.state.modal._id})
    .then((res) => {
      if(res.data.success) {
        set_display('.modal', 'none');
        // update props.posts
        var posts = this.props.posts;
        var len = this.props.posts.length;
        for(var i=0; i<len; i++) {
          if(this.props.posts[i]._id == res.data.removedId) {
            posts.splice(i, 1);
            break;
          }
        }
        this.props.setPosts(posts);
        // update props.user
        var user = this.props.user;
        user.posts = res.data.count;
        this.props.setUser(user);
      } else {

      }
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    var trash = '';
    if(this.props.loggedIn) trash = (
      <li className='right trash' onClick={(e) => {this.click_trash(e)}}><i className='fa fa-trash-o'></i></li>
    )

    return (
      <div>
        {redirect}
        <ul className='icons'>
          <li className='left heart' onClick={(e) => {this.click_heart(e)}}>
            <i className={'fa fa-heart-o ' + (this.state.liked ? 'active' : '')}></i>
          </li>
          <li className='left balloon' onClick={(e) => {this.click_balloon(e)}}><i className='fa fa-comment-o'></i></li>
          {trash}
          <li className='right bookmark' onClick={(e) => {this.click_bookmark(e)}}>
            <i className={'fa fa-bookmark-o ' + (this.state.bookmarked ? 'active' : '')}></i>
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
  postIndex: state.postIndex,
  mode: state.mode
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
    }
  };
};
export default connect(mstp, mdtp)(Icons);
