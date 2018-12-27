import {http} from '../modules/http';

export function post_comment(comp, postId, val) {
  if(val != '') {
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/comments/post', {postId: postId, content: val})
    .then((res) => {
      console.log('/comments/post='+JSON.stringify(res.data));
      if(res.data.success) {
        var comment = res.data.comment;
        comment.avatar = server+'/images/'+comp.props.account._id+'/avatar/'+comp.props.account.avatar;
        comp.setState({comments: [comment, ...comp.state.comments]});
      }
    });
  }
}

export function post_reply(commentId, val) {

}

export function remove_comment(commentId) {

}

export function remove_reply(replyId) {

}

export function get_comments(postId) {
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

export function get_replies(commentId) {

}
