const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const CommentLike = require('../models/commentLike');
const Reply = require('../models/reply');
const User = require('../models/user');
const Post = require('../models/post');
const get_avatars = require('../modules/get_avatars');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

router.get('/get', (req, res) => {
  var userId = req.query.userId;
  var postId = req.query.postId;
  if(!postId) {
    res.send({success: false, msg: 'Error: postId is undefined.'});
    return;
  }
  Comment.find({postId: postId, replyTo: null}).sort({'createdAt': -1}).exec((err, comments) => {
    get_avatars(comments, async (avatars) => {
      if(userId) {
        for(var i=0; i<comments.length; i++) {
          var c = await CommentLike.count({userId: userId, postId: comments[i]._id});
          if(c > 0) comments[i].liked = true;
        }
      }
      res.send({success: true, comments: comments, avatars: avatars});
    });
  });
});

router.post('/post', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  var postId = req.body.postId;
  var content = req.body.content;
  if(invalid_data(res, user, 'Not authorized.')) return;
  if(invalid_data(res, postId, 'Error: postId is undefined.')) return;
  if(invalid_data(res, content, 'Error: content is undefined.')) return;
  var obj = {
    postId: postId,
    userId: user._id,
    username: user.username,
    content: content
  };
  var newComment = new Comment(obj);
  newComment.save((err, comment) => {
    if(err) res.send({success: false, msg: err});
    count_comments(comment.postId, (c) => {
      res.send({success: true, comment: comment, count: c});
    });
  });
});

function invalid_data(res, data, msg) {
  var invalid = false;
  if(!data) {
    res.send({success: false, msg: msg});
    invalid = true;
  }
  return invalid;
}

router.get('/replies', (req, res) => {
  Reply.find({commentId: req.query.commentId}).exec((err, replies) => {
    if(err) res.send({success: false, msg: err});
    else {
      get_avatars(replies, (avatars) => {
        res.send({success: true, replies: replies, avatars: avatars});
      });
    }
  });
});

router.post('/reply', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  var commentId = req.body.commentId;
  var content = req.body.content;
  if(invalid_data(res, commentId, 'Error: commentId is undefined.')) return;
  if(invalid_data(res, content, 'Error: content is undefined.')) return;
  // check comment level by replyTo
  var obj = {
    commentId: commentId,
    userId: user._id,
    username: user.username,
    content: content,
  };
  var newReply = new Reply(obj);
  newReply.save((err, reply) => {
    if(err) res.send({success: false, msg: err});
    count_replies(commentId, () => {
      Comment.findOne({_id: commentId}, (err, comment) => {
        count_comments(comment.postId, () => {
          res.send({success: true, reply: reply});
        });
      });
    });
  });
});

// remove reply
router.post('/removeReply', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  console.log('a');
  var replyId = req.body.replyId;
  Reply.findOne({_id: replyId}, (err, reply) => {
    if(reply.userId == user._id) {
      reply.remove((err) => {
        Comment.findOne({_id: reply.commentId}, (err, comment) => {
          if(err) res.send({success: false, msg: err});
          count_replies(reply.commentId, () => {
            count_comments(comment.postId, (c) => {
              res.send({success: true, count: c});
            });
          });
        });
      });
    }
  });
});

// remove reply
router.post('/removeComment', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  var commentId = req.body.commentId;
  Comment.findOne({_id: commentId}, (err, comment) => {
    if(user._id && comment.userId == user._id) {
      comment.remove((err) => {
        if(err) res.send({success: false, msg: err});
        Reply.find({commentId}, async (err, replies) => {
          var len = replies.length;
          for(var i=0; i<len; i++) {
            await replies[i].remove();
          }
          count_comments(comment.postId, (c) => {
            res.send({success: true, count: c});
          });
        });
      });
    }
  });
});

function count_comments(postId, cb) { // count comments and get_replies
  var c = 0;
  Comment.find({postId}, async (err, comments) => {
    c = comments.length;
    for(var i=0; i<comments.length; i++) {
        c += await Reply.count({commentId: comments[i]._id});
    }
    Post.update({_id: postId}, {comments: c}, (err) => {
      if(err) console.log(err);
      cb(c);
    });
  });
}

function count_replies(commentId, cb) { // count comments and get_replies
  Reply.count({commentId}, (err, c) => {
    Comment.update({_id: commentId}, {replies: c}, (err) => {
      if(err) console.log(err);
      cb();
    });
  });
}

module.exports = router;
