import React from "react";
import {Redirect, NavLink, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display, from_now} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server'
import './TPost.css';

import TMedia from './TMedia';
import TIcons from './TIcons';
import Comment from '../comments/Comment';

class TPost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      showComments: false
    }

    this.get_comments = this.get_comments.bind(this);
    this.post_comment = this.post_comment.bind(this);
    this.post_reply = this.post_reply.bind(this);
    this.change_value = this.change_value.bind(this);
    this.on_focus = this.on_focus.bind(this);
    this.show_comments = this.show_comments.bind(this);

    this.myRef = React.createRef();
  }

  show_comments() {
    this.setState({showComments: true}, () => {
      this.get_comments();
    });
  }

  get_comments() {
    http.get('/comments/get', {params: {userId: this.props.account._id, postId: this.props.post._id}})
    .then((res) => {
      //console.log('/comments/get='+JSON.stringify(res.data));
      if(res.data.success) {
        var comments = res.data.comments;
        for(var i=0; i<comments.length; i++) {
          var c = comments[i];
          comments[i].avatar = server+'/images/'+c.userId+'/avatar/'+res.data.avatars[c.username];
        }
        this.setState({comments: comments});
      }
    });
  }

  change_value(e) {
    if(!this.props.loggedIn) {
      this.setState({redirect: '/login'});
    } else {
      if(e.target.value == '') {
        this.props.setReplyTo('');
      }
    }
  }

  on_focus(username) {
    this.myRef.current.focus();
    this.myRef.current.value = '@'+username+' ';
  }

  post_comment(e, postId) {
    var val = e.target.value;
    if(this.props.loggedIn && e.key == 'Enter' && val != '') {
      e.target.value = '';
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/comments/post', {postId: postId, content: val})
      .then((res) => {
        console.log('/comments/post='+JSON.stringify(res.data));
        if(res.data.success) {
          this.setState({comments: [], showComments: true}, () => {
            this.get_comments();
          });
          /*
          var comment = res.data.comment;
          comment.avatar = server+'/images/'+this.props.account._id+'/avatar/'+this.props.account.avatar;
          this.setState({comments: [comment, ...this.state.comments]});*/
        }
      });
    }
  }

  post_reply(e) {
    var val = e.target.value;
    var id = this.props.replyTo;
    console.log('id='+id);
    if(this.props.loggedIn && e.key == 'Enter' && val != '') {
      e.target.value = '';
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/comments/reply', {commentId: id, content: val})
      .then((res) => {
        console.log('/comments/reply='+JSON.stringify(res.data));
        this.props.setReplyTo('');
        if(res.data.success) {
          this.setState({comments: []}, () => {
            this.get_comments();
          });
        }
      });
    }
  }

  render() {
    // likes
    var likes = this.props.post.likes + ' Like';
    if(this.props.post.likes > 1) likes = this.props.post.likes + ' Likes';

    // date
    var time = new Date(this.props.post.createdAt).getTime();
    var date = from_now(time);

    // show comments
    if(!this.state.showComments) {
      var showComments = '';
      if(this.props.post.comments == 1) {
        showComments = <div className='show_comments' onClick={this.show_comments}>View 1 comment...</div>;
      }
      if(this.props.post.comments > 1) {
        showComments = <div className='show_comments' onClick={this.show_comments}>View all {this.props.post.comments} comments...</div>;
      }
    }

    // comments
    var comments = [];
    //console.log('state.comments='+JSON.stringify(this.state.comments));
    for(var i=0; i<this.state.comments.length; i++) {
      comments.push(
        <Comment key={this.state.comments[i]._id} index={i}
        comment={this.state.comments[i]}
        get_comments={this.get_comments}
        on_focus={this.on_focus}>
        </Comment>
      );
    }

    // input for new comment or new reply
    var input;
    if(this.props.replyTo == '') {
      input = <input ref={this.myRef}
        className='comment_input' type='text' placeholder='Add a comment...'
        onChange={(e) => {this.change_value(e)}}
        onKeyPress={(e) => {this.post_comment(e, this.props.post._id)}}
      />
    } else {
      input = <input ref={this.myRef}
        className='comment_input' type='text' placeholder='Add a reply...'
        onChange={(e) => {this.change_value(e)}}
        onKeyPress={(e) => {this.post_reply(e)}}
      />
    }

    return (
      <div className='tPost'>
        <div className='row user'>
          <div className='avatar'><img src={this.props.post.avatar} /></div>
          <div className='username'><Link to={'/posts?user='+this.props.post.username}>@{this.props.post.username}</Link></div>
        </div>
        <TMedia post={this.props.post} />
        <TIcons post={this.props.post} index={this.props.index} input={this.myRef} />
        <div className='row content'>
          <h2>{this.props.post.title}</h2>
          <p>{this.props.post.content}</p>
        </div>
        <div className='row data'>
          <span className='likes'>{likes}</span>
          <span className='date'>{date}</span>
        </div>
        <div className='row comments'>
          {showComments}
          {comments}
        </div>
        <div className='row input'>
          <div className='borderTop'>
            {input}
          </div>
        </div>
      </div>
    )
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  account: state.account,
  posts: state.posts,
  postIndex: state.postIndex,
  replyTo: state.replyTo
});

var mdtp = dispatch => {
  return {
    setPosts: (posts) => {
      dispatch({type: 'POSTS', payload: posts});
    },
    setReplyTo: (id) => {
      dispatch({type: 'REPLYTO', payload: id});
    }
  };
};
export default connect(mstp, mdtp)(TPost);
