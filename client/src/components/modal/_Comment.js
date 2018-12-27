import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, set_display, from_now} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './Comment.css';

class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      postId: '',
      comment: this.props.comment,
      liked: false,
      loggedIn: false,
      accountName: '',
      viewReplies: true,
    }

    this.click_heart = this.click_heart.bind(this);
    this.click_trash = this.click_trash.bind(this);
    this.click_reply = this.click_reply.bind(this);
    this.view_replies = this.view_replies.bind(this);
    this.remove_comment = this.remove_comment.bind(this);
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
          // update posts
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
    http.post('/comments/remove', {commentId: this.state.comment._id, postId: this.state.comment.postId})
    .then((res) => {
      if(res.data.success) {
        this.props.get_comments();
        var posts = this.props.posts;
        var index= this.props.postIndex;
        posts[index].comments = posts[index].comments - 1;
        if(posts[index].comments < 0) posts[index].comments = 0;
        this.props.setPosts(posts);
      }
    });
  }

  click_reply(e) {
    if (!this.props.loggedIn) {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    } else {
      _('.comment_input').focus();
      _('.comment_input').value = '@'+this.state.comment.username+' ';
      this.props.setReplyTo(this.state.comment._id);
    }
  }

  view_replies() {
    console.log('view_replies()');
    http.get('/comments/replies', {params: {ids: this.state.comment.replies}})
    .then((res) => {
      //console.log('/comments/replies='+JSON.stringify(res.data.replies));
      if(res.data.success) {
        var replies = res.data.replies;
        for(var i=0; i<replies.length; i++) {
          replies[i].reply = '';
          replies[i].avatar = server+'/images/'+replies[i].userId+'/avatar/'+res.data.avatars[replies[i].username];
        }
        this.props.insert_comments((this.props.index+1), res.data.replies);
        this.setState({viewReplies: false});
      }
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />

    // icon to like or remove
    var icon = '';
    if(this.state.loggedIn && this.props.account.username == this.state.comment.username) {
      icon = (
        <div className='icon_wrapper' onClick={(e) => {this.click_trash(e)}}>
          <i className='fa fa-trash-o'></i>
        </div>
      );
    }　else {
      icon = (
        <div className='icon_wrapper' onClick={(e) => {this.click_heart(e)}}>
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

    // view replies
    var replies = '';
    if(this.state.viewReplies && this.state.comment.replies && this.state.comment.replies.length > 0) {
      replies = (
        <div className='view_replies' onClick={() => {this.view_replies()}}>
          - View replies {'('+this.state.comment.replies.length+')'}
        </div>
      );
    }

    return (
      <div className={(this.state.comment.replyTo) ? 'comment reply' : 'comment'}>
        {redirect}
        <div className='col_left'>
          <div className='avatar_wrapper'>
            <img src={this.state.comment.avatar} />
          </div>
        </div>
        <div className='col_right'>
          <div>
            <div><p><span>{this.state.comment.username} </span><span>{this.state.comment.content}</span></p></div>
            {icon}
          </div>
          <div className='data'>
            <div className='date'>{date}</div>
            <div className='likes'>{likes}</div>
            <div className='reply' onClick={(e) => {this.click_reply(e)}}>Reply</div>
          </div>
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

export default connect(mstp, mdtp, null, {pure:false})(Comment);
