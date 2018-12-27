const express = require('express');
const router = express.Router();
const CommentLike = require('../models/commentLike');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

// get user liked or not
router.get('/liked', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    var obj = {
      userId: user._id,
      postId: req.query.postId // comment id
    };
    CommentLike.count(obj, (err, c) => {
      if(err) res.send(err);
      if(c == 0) {
        // not liked by user
        res.send({success: true, liked: false})
      } else {
        // liked by user
        res.send({success: true, liked: true})
      }
    })
  }
});

// like or unlike a post
router.post('/post', (req, res) => {
  console.log('0');
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    var obj = {
      userId: user._id,
      postId: req.body.postId
    };
    CommentLike.count(obj, (err, c) => {
      if(c == 0) {
        // like
        var like = new CommentLike(obj);
        like.save((err) => {
          update_counts(obj, function(postC) {
            res.send({success: true, liked: true, likes: postC});
          });
        });
      } else {
        // unlike
        CommentLike.findOneAndRemove(obj, (err) => {
          update_counts(obj, function(postC) {
            res.send({success: true, liked: false, likes: postC});
          });
        });
      }
    });
  }
});

function update_counts(obj, cb) {
  CommentLike.count({postId: obj.postId}, (err, c) => {
    Comment.update({_id: obj.postId}, {likes: c}, (err) => {
      cb(c);
    });
  });
}

module.exports = router;
