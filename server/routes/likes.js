const express = require('express');
const router = express.Router();
const Like = require('../models/like');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

// get user liked or not
router.get('/liked', (req, res) => {
  if(!req) return;
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    var obj = {
      userId: user._id,
      postId: req.query.postId
    };
    Like.count(obj, (err, c) => {
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
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
    var obj = {
      userId: user._id,
      postId: req.body.postId
    };
    Like.count(obj, (err, c) => {
      if(c == 0) {
        // like
        var like = new Like(obj);
        like.save((err) => {
          update_counts(obj, function(userC, postC) {
            res.send({success: true, liked: true, userLikes: userC, postLikes: postC});
          });
        });
      } else {
        // unlike
        Like.findOneAndRemove(obj, (err) => {
          update_counts(obj, function(userC, postC) {
            res.send({success: true, liked: false, unlikedId: obj.postId, userLikes: userC, postLikes: postC});
          });
        });
      }
    });
});

function update_counts(obj, cb) {
  Like.count({userId: obj.userId}, (err, userC) => {
    User.update({_id: obj.userId}, {likes: userC}, (err) => {
      Like.count({postId: obj.postId}, (err, postC) => {
        Post.update({_id: obj.postId}, {likes: postC}, (err) => {
          cb(userC, postC);
        });
      });
    });
  });
}

module.exports = router;
