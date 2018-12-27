const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../models/user');
const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const CommentLike = require('../models/commentLike');
const Relationship = require('../models/relationship');
const Bookmark = require('../models/bookmark');
const get_date = require('../modules/get_date');
const upload_image = require('../modules/upload_image');
const get_hashtags = require('../modules/get_hashtags');
const get_avatars = require('../modules/get_avatars');
const postsController = require('../controllers/postsController');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

router.post('/create', postsController.create_image_post);
router.post('/video', postsController.create_video_post);

// read
router.get('/read', (req, res) => {
  //console.log('req.query.skip='+req.query.skip);
  var skip = parseInt(req.query.skip);
  Post.find().sort({createdAt: -1}).skip(skip).limit(12).exec((err, posts) => {
    if(err) res.send({success: false, msg: err});
    else {
      jwt.verify(req.headers.authorization, secret, async(err, user) => { // get user if logged in
        if(user) {
          for(var post of posts) {
            var likes = await Like.count({userId: user._id, postId: post._id});
            if(likes > 0) post.liked = true;
            var bookmarks = await Bookmark.count({userId: user._id, postId: post._id});
            if(bookmarks > 0) post.bookmarked = true;
          }
        }
        get_avatars(posts, function(avatars) {
          res.send({success: true, posts, avatars});
        });
      });
    }
  });
});

router.get('/getTimeline', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  // get following ids
  var ids = [user._id];
  Relationship.find({followerId: user._id}, (err, rows) => {
    for(var i=0; i<rows.length; i++) {
      ids.push(rows[i].followedId);
    }
    // get posts by following ids
    var skip = parseInt(req.query.skip);
    Post.find({userId: {$in: ids}}).sort({createdAt: -1}).skip(skip).limit(12).exec(async(err, posts) => {
      if(err) res.send({success: false, msg: err});
      if(user) {
        for(var post of posts) {
          var likes = await Like.count({userId: user._id, postId: post._id});
          if(likes > 0) post.liked = true;
          var bookmarks = await Bookmark.count({userId: user._id, postId: post._id});
          if(bookmarks > 0) post.bookmarked = true;
        }
      }
      get_avatars(posts, (avatars) => {
        res.send({success: true, posts, avatars});
      });
    });
  });
});

// read by username
router.get('/readByUsername', (req, res) => {
  var skip = parseInt(req.query.skip);
  var username = req.query.username;
  if(username) {
    Post.find({username}).sort({createdAt: -1}).skip(skip).limit(12).exec((err, posts) => {
      if(err) res.send(err);
      jwt.verify(req.headers.authorization, secret, async(err, user) => {
        if(user) {
          for(var post of posts) {
            var likes = await Like.count({userId: user._id, postId: post._id});
            if(likes > 0) post.liked = true;
            var bookmarks = await Bookmark.count({userId: user._id, postId: post._id});
            if(bookmarks > 0) post.bookmarked = true;
          }
        }
        get_avatars(posts, (avatars) => {
          res.send({success: true, posts, avatars});
        });
      });

    });
  } else {
    res.send({success: false});
  }
});

// read by likes
router.get('/readByLikes', (req, res) => {
  var skip = parseInt(req.query.skip);
  var username = req.query.username;
  var userId = '';
  var ids = [];
  if(username) {
    User.findOne({username}).select('_id').exec((err, user) => {
      userId = user._id;
      Like.find({userId}).skip(skip).sort({createdAt: -1}).exec((err, likes) => {
        for(var i=0; i<likes.length; i++) {
          ids.push(likes[i].postId);
        }
        Post.find({_id: {$in: ids}}).skip(skip).limit(12).exec((err, posts) => {
          if(err) res.send(err);
          jwt.verify(req.headers.authorization, secret, async(err, user) => {
            // liked or not by user
            if(user) {
              for(var post of posts) {
                var countL = await Like.count({userId: user._id, postId: post._id});
                if(countL > 0) post.liked = true;
                var countB = await Bookmark.count({userId: user._id, postId: post._id});
                if(countB > 0) post.bookmarked = true;
              }
            }
            // sort by likes
            for(var post of posts) {
              for(var like of likes) {
                if(post._id.equals(like.postId)) {
                  post.time = like.createdAt;
                }
              }
            }
            posts.sort((a, b) => {
              if (a.time < b.time)
                return 1;
              if (a.time > b.time)
                return -1;
              return 0;
            });
            get_avatars(posts, (avatars) => {
              res.send({success: true, posts, avatars});
            });
          });
        });
      });
    });
  } else {
    res.send({success: false});
  }
});

// read by bookmarks
router.get('/readByBookmarks', (req, res) => {
  var skip = parseInt(req.query.skip);
  var username = req.query.username;
  var userId = '';
  var ids = [];
  if(username) {
    User.findOne({username}).select('_id').exec((err, user) => {
      userId = user._id;
      Bookmark.find({userId}).skip(skip).sort({createdAt: -1}).exec((err, bookmarks) => {
        for(var i=0; i<bookmarks.length; i++) {
          ids.push(bookmarks[i].postId);
        }
        Post.find({_id: {$in: ids}}).limit(12).exec((err, posts) => {
          if(err) res.send(err);
          jwt.verify(req.headers.authorization, secret, async(err, user) => {
            if(user) {
              for(var post of posts) {
                var countL = await Like.count({userId: user._id, postId: post._id});
                if(countL > 0) post.liked = true;
                var countB = await Bookmark.count({userId: user._id, postId: post._id});
                if(countB > 0) post.bookmarked = true;
              }
            }
            // sort by bookmarks
            for(var post of posts) {
              for(var bookmark of bookmarks) {
                if(post._id.equals(bookmark.postId)) {
                  post.time = bookmark.createdAt;
                }
              }
            }
            posts.sort((a, b) => {
              if (a.time < b.time)
                return 1;
              if (a.time > b.time)
                return -1;
              return 0;
            });
            get_avatars(posts, (avatars) => {
              res.send({success: true, posts, avatars});
            });
          });
        });
      });
    });
  } else {
    res.send({success: false});
  }
});

// remove
router.post('/remove', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }
  var userId = user._id;
  var postId = req.body.postId;
  Post.findOne({_id: postId}, (err, post) => {
    if(err) {
      res.send({success: false, msg: err});
      retrun
    } else if(post && userId == post.userId) {
      var imageDir = './public/images/'+userId+'/posts/'+post.dir;
      removePostDir(imageDir);
      Post.findOneAndRemove({_id: postId}, (err) => {
        Like.find({postId: postId}).remove((err) => {
          Bookmark.find({postId: postId}).remove((err) => {
            Comment.find({postId: postId}).remove((err) => {
              CommentLike.find({postId: postId}).remove((err) => {
                update_user(userId, function(postC) {
                  res.send({success: true, msg: 'Removed the post.', removedId: postId, count: postC});
                });
              });
            });
          });
        });
      });
    } else {
      console.log('not user\'s');
      res.send({success: false, msg: 'Not user\'s post.'});
    }
  });
});

function removePostDir(path) {
  if(fs.existsSync(path)) {
    console.log('exists='+path);
    fs.readdirSync(path).forEach(function(image, index) {
      var imagePath = path + '/' + image;
      fs.unlinkSync(imagePath);
    });
    fs.rmdirSync(path);
  } else {
    console.log('not exists='+path);
  }
}

function update_user(id, cb) {
  Post.count({userId: id}, (err, postC) => {
    Like.count({userId: id}, (err, likeC) => {
      Bookmark.count({userId: id}, (err, bookmarkC) => {
        User.update({_id: id}, {posts: postC, likes: likeC, bookmarks: bookmarkC}, (err) => {
          cb(postC, likeC, bookmarkC);
        });
      });
    });
  });
}



// search tag
router.get('/search/:tag', (req, res) => {
  var t = req.params.tag;
  console.log('/search/:tag='+t);
  Post.find({hashtags: {$regex: t}}, 'hashtags', (err, rows) => {
    //res.send({count: rows.length});
    var tags = {};
    for(var i=0; i<rows.length; i++) {
      for(var j=0; j<rows[i].hashtags.length; j++) {
        var tag = rows[i].hashtags[j];
        if(tag.indexOf(t) > -1) {
          if((t.length + 4) >= tag.length) {
            if(tags[tag] == null) {
              tags[tag] = 1;
            } else {
              tags[tag] += 1;
            }
          }
        }
      }
    }
    res.send({success: true, tags});
  });
});

// read by tag
router.get('/tag/:tag', (req, res) => {
  console.log('/posts/tag/:tag='+req.params.tag);
  Post.find({hashtags: req.params.tag}).sort({createdAt: -1}).exec((err, posts) => {
    if(err) res.send({success: false, msg: err});
    else {
      get_avatars(posts, (avatars) => {
        res.send({
          success: true,
          posts: posts,
          avatars: avatars,
          hashtag: req.params.tag
        });
      });
    }
  });
});

// search tag (ajax)
//router.get('/search/:tag', ajaxController.search);

// read by tag
//router.get('/tag/:tag', ajaxController.get_posts_by_tag);



module.exports = router;
