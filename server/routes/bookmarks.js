const express = require('express');
const router = express.Router();
const Bookmark = require('../models/bookmark');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

// get user bookmarked and total bookmarks
router.get('/bookmarked', (req, res) => {
  if(!req) return;
  console.log('user='+user);
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    var obj = {
      userId: user._id,
      postId: req.query.postId
    };
    Bookmark.count(obj, (err, c) => {
      if(err) res.send(err);
      if(c == 0) {
        // not bookmarked by user
        res.send({success: true, bookmarked: false})
      } else {
        // bookmarked by user
        res.send({success: true, bookmarked: true})
      }
    })
  }
});

// bookmark or unbookmark a post
router.post('/post', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    var obj = {
      userId: user._id,
      postId: req.body.postId
    };
    Bookmark.count(obj, (err, c) => {
      if(c == 0) {
        // bookmark
        var bookmark = new Bookmark(obj);
        bookmark.save((err) => {
          update_counts(obj, (userC, postC) => {
            res.send({success: true, bookmarked: true, userBookmarks: userC, postBookmarks: postC});
          });
        });
      } else {
        // unbookmark
        Bookmark.findOneAndRemove(obj, (err) => {
          update_counts(obj, (userC, postC) => {
            res.send({success: true, bookmarked: false, unbookmarkedId: obj.postId, userBookmarks: userC, postBookmarks: postC});
          });
        });
      }
    });
  }
});

function update_counts(obj, cb) {
  Bookmark.count({userId: obj.userId}, (err, userC) => {
    User.update({_id: obj.userId}, {bookmarks: userC}, (err) => {
      Bookmark.count({postId: obj.postId}, (err, postC) => {
        Post.update({_id: obj.postId}, {bookmarks: postC}, (err) => {
          cb(userC, postC);
        });
      });
    });
  });
}

module.exports = router;
