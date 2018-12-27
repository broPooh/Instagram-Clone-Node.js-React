import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, set_display, from_now} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './Comment.css';

import Reply from './Reply';

class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      postId: '',
      comment: this.props.comment,
      replies: [],
      liked: false,
      accountName: '',
      showReplies: false,
    }

    this.click_heart = this.click_heart.bind(this);
    this.click_trash = this.click_trash.bind(this);
    this.click_reply = this.click_reply.bind(this);
    this.show_replies = this.show_replies.bind(this);
    this.remove_comment = this.remove_comment.bind(this);
  }

  click_heart(e) {
    if (!this.props.loggedIn) {
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
        action: this.remove_comment
      }
      this.props.setDialog(dialog);
      set_display('.dialog', 'block');
    }
  }

  remove_comment() {
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/comments/removeComment', {commentId: this.state.comment._id})
    .then((res) => {
      console.log('/comments/removeComment='+JSON.stringify(res.data));
      if(res.data.success) {
        var posts = this.props.posts;
        posts[this.props.postIndex].comments = res.data.count;
        this.props.setPosts(posts);
        this.props.get_comments();
      }
    });
  }

  click_reply(e) {
    if (!this.props.loggedIn) {
      this.setState({redirect: '/login'});
    } else {
      this.props.setReplyTo(this.state.comment._id);
      this.props.on_focus(this.state.comment.username);
    }
  }

  show_replies() {
    console.log('show_replies()');
    this.setState({showReplies: true, replies: []}, () => {
      http.get('/comments/replies', {params: {commentId: this.state.comment._id}})
      .then((res) => {
        console.log('/comments/replies='+JSON.stringify(res.data.replies));
        if(res.data.success) {
          var replies = res.data.replies;
          for(var i=0; i<replies.length; i++) {
            replies[i].reply = '';
            replies[i].avatar = server+'/images/'+replies[i].userId+'/avatar/'+res.data.avatars[replies[i].username];
          }
          this.setState({replies});
        }
      });
    });

  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />

    // icon to like or remove
    var icon = '';
    if(this.props.account._id == this.state.comment.userId) {
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
    var time = new Date(this.state.comment.createdAt).getTime();
    var date = from_now(time);

    // likes
    var likes = this.state.comment.likes + ' like';
    if(this.state.comment.likes >= 2) likes = likes + 's';

    // show replies
    var showReplies = '';
    if(!this.state.showReplies && this.state.comment.replies > 0) {
      showReplies = (
        <div className='show_replies' onClick={() => {this.show_replies()}}>
          - View replies {'('+this.state.comment.replies+')'}
        </div>
      );
    }

    // replies
    var replies = [];
    if(this.state.replies) {
      for(var i=0; i<this.state.replies.length; i++) {
        replies.push(<Reply key={this.state.replies[i]._id}
          reply={this.state.replies[i]}
          commentId={this.props.comment}
          show_replies={this.show_replies}
          click_reply={this.click_reply} />);
      }
    }

    return (
      <div className='comment'>
        {redirect}
        <div className='left'>
          <div className='avatar'>
            <img src={this.state.comment.avatar} />
          </div>
        </div>
        <div className='right'>
          <div className='content'>
            <div><p><span>{this.state.comment.username} </span><span>{this.state.comment.content}</span></p></div>
            {icon}
          </div>
          <div className='data'>
            <div className='date'>{date}</div>
            <div className='likes'>{likes}</div>
            <div className='reply_button' onClick={(e) => {this.click_reply(e)}}>Reply</div>
          </div>
        </div>
        {showReplies}
        <div className='replies'>
          {replies}
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

export default connect(mstp, mdtp)(Comment);
