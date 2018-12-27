import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, set_display, from_now} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './Right.css';

import Comment from '../comments/Comment';
import Icons from './Icons';

class Right extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      modal: {},
      comments: [],
      showComments: false
    }

    this.change_value = this.change_value.bind(this);
    this.on_focus = this.on_focus.bind(this);
    this.get_comments = this.get_comments.bind(this);
    this.post_comment = this.post_comment.bind(this);
    this.post_reply = this.post_reply.bind(this);
    this.show_comments = this.show_comments.bind(this);
    this.clear_comments = this.clear_comments.bind(this);

    this.modalInput = React.createRef();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.modal) {
      this.setState({
        redirect: '',
        modal: nextProps.modal
      });
    }

    if(nextProps.clearComments) {
      this.clear_comments();
    }
  }

  clear_comments() {
    this.setState({
      comments: [],
      showComments: false
    });
  }

  show_comments() {
    this.setState({showComments: true}, () => {
      this.get_comments();
    });
  }

  get_comments() {
    this.setState({comments: []}, () => {
      http.get('/comments/get', {params: {userId: this.props.account._id, postId: this.state.modal._id}})
      .then((res) => {
        //console.log('/comments/get='+JSON.stringify(res.data));
        if(res.data.success) {
          var comments = res.data.comments;
          if(res.data.avatars) {
            for(var i=0; i<comments.length; i++) {
              var c = comments[i];
              comments[i].avatar = server+'/images/'+c.userId+'/avatar/'+res.data.avatars[c.username];
            }
          }
          this.setState({comments: comments});
        }
      });
    });
  }

  change_value(e) {
    if(this.props.loggedIn) {
      //this.setState({comment: e.target.value});
      if(e.target.value == '') {
        this.props.setReplyTo('');
      }
    } else {
      set_display('.modal', 'none');
      this.setState({redirect: '/login'});
    }
  }

  on_focus(username) {
    this.modalInput.current.focus();
    this.modalInput.current.value = '@'+username+' ';
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
          // update props.posts
          console.log('comments c ='+res.data.count);
          var posts = this.props.posts;
          posts[this.props.postIndex].comments = res.data.count;
          this.props.setPosts(posts);
          // reload comments
          this.setState({showComments: true}, () => {
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
          this.setState({showComments: true}, () => {
            this.get_comments();
          });
        }
      });
    }
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />

    // avatar
    var avatar = (this.state.modal.avatar) ? <img className='avatar' src={this.state.modal.avatar} /> : '';

    // show comments
    if(!this.state.showComments) {
      var showComments = '';
      if(this.state.modal.comments == 1) {
        showComments = <div className='show_comments' onClick={this.show_comments}>View 1 comment...</div>;
      }
      if(this.state.modal.comments > 1) {
        showComments = <div className='show_comments' onClick={this.show_comments}>View all {this.state.modal.comments} comments...</div>;
      }
    }

    // comments
    var comments = [];
    console.log('comments='+this.state.comments.length);
    for(var i=0; i<this.state.comments.length; i++) {
      comments.push(
        <Comment key={i} index={i}
        comment={this.state.comments[i]}
        get_comments={this.get_comments}
        on_focus={this.on_focus}>
        </Comment>
      );
    }

    // likes
    var likes = '0 Like';
    if(this.props.modal) {
      if(this.props.modal.likes == 1) likes = '1 Like';
      if(this.props.modal.likes > 1) likes = this.props.modal.likes + ' Likes';
    }

    // date
    var time = new Date(this.state.modal.createdAt).getTime();
    var date = from_now(time);

    // input for new comment or new reply
    var input;
    if(this.props.replyTo == '') {
      input = <input ref={this.modalInput}
        className='comment_input' type='text' placeholder='Add a comment...'
        onChange={(e) => {this.change_value(e)}}
        onKeyPress={(e) => {this.post_comment(e, this.state.modal._id)}}
      />
    } else {
      input = <input ref={this.modalInput}
        className='comment_input' type='text' placeholder='Add a reply...'
        onChange={(e) => {this.change_value(e)}}
        onKeyPress={(e) => {this.post_reply(e)}}
      />
    }

    return (
      <div className='right_wrapper'>
        {redirect}
        <div className='right_header'>
          <div className='avatar_wrapper'>
            {avatar}
          </div>
          <div className='username_wrapper'>
            <NavLink to={'/posts?user='+this.state.modal.username} onClick={() => {this.close_modal()}}>
              <h3 className='username'>@{this.state.modal.username}</h3>
            </NavLink>
          </div>
        </div>
        <div className='right_body'>
          <div className='content'>
            <h4>{this.state.modal.title}</h4>
            <p>{this.state.modal.content}</p>
            <div className='comments'>
              {showComments}
              {comments}
            </div>
          </div>
        </div>
        <div className='right_footer'>
          <Icons modal={this.state.modal} />
          <div className='likes'>{likes}</div>
          <div className='date'>{date}</div>
        </div>
        <div className='right_bottom'>
          {input}
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
    setModal: (modal) => {
      dispatch({type: 'MODAL', payload: modal});
    },
    setReplyTo: (id) => {
      dispatch({type: 'REPLYTO', payload: id});
    }
  };
};
export default connect(mstp, mdtp, null, {pure: false})(Right);
