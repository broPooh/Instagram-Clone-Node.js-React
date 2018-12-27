import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, set_display, from_now} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './Reply.css';

class Reply extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      commentId: this.props.commentId,
      reply: this.props.reply,
      liked: false,
      accountName: ''
    }

    this.click_heart = this.click_heart.bind(this);
    this.click_trash = this.click_trash.bind(this);
    this.remove_reply = this.remove_reply.bind(this);
  }

  click_heart(e) {
    if (!this.state.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/commentLikes/post', {postId: this.state.comment._id})
      .then((res) => {
        console.log('/commentLikes/post='+JSON.stringify(res.data));
        if(res.data.success) {
          this.setState({liked: res.data.liked, likes: res.data.likes});
        }
      });
    }
  }

  click_trash(e) {
    e.preventDefault();
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      var dialog = {
        message: 'Remove this comment?',
        cancel: 'Cancel',
        ok: 'OK',
        action: this.remove_reply
      }
      this.props.setDialog(dialog);
      set_display('.dialog', 'block');
    }
  }

  remove_reply() {
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/comments/removeReply', {replyId: this.state.reply._id})
    .then((res) => {
      console.log('/comments/removeReply='+JSON.stringify(res.data));
      if(res.data.success) {
        var posts = this.props.posts;
        posts[this.props.postIndex].comments = res.data.count;
        this.props.setPosts(posts);
        this.props.show_replies();
      }
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />

    // icon to like or remove
    var icon = '';
    if(this.props.account._id == this.state.reply.userId) {
      icon = (
        <div className='icon' onClick={(e) => {this.click_trash(e)}}>
          <i className='fa fa-trash-o'></i>
        </div>
      );
    }　else {
      icon = (
        <div className='icon' onClick={(e) => {this.click_heart(e)}}>
          <i className={'fa fa-heart-o ' + (this.state.liked ? 'active' : '')}></i>
        </div>
      );
    }

    // date
    var time = new Date(this.state.reply.createdAt).getTime();
    var date = from_now(time);

    // likes
    var likes = this.state.reply.likes + ' like';
    if(this.state.reply.likes >= 2) likes = likes + 's';

    return (
      <div className='reply'>
        {redirect}
        <div className='left'>
          <div className='avatar'>
            <img src={this.state.reply.avatar} />
          </div>
        </div>
        <div className='right'>
          <div>
            <div><p><span>{this.state.reply.username} </span><span>{this.state.reply.content}</span></p></div>
            {icon}
          </div>
          <div className='data'>
            <div className='date'>{date}</div>
            <div className='likes'>{likes}</div>
            <div className='reply_button' onClick={(e) => {this.props.click_reply(e)}}>Reply</div>
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  account: state.account,
  posts: state.posts,
  postIndex: state.postIndex
});

var mdtp = dispatch => {
  return {
    setDialog: (dialog) => {
      dispatch({type: 'DIALOG', payload: dialog});
    },
    setPosts: (posts) => {
      dispatch({type: 'POSTS', payload: posts});
    },
    setReplyTo: (id) => {
      dispatch({type: 'REPLYTO', payload: id});
    }
  };
};

export default connect(mstp, mdtp)(Reply);
