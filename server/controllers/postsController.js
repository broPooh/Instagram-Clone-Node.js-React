const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const CommentLike = require('../models/commentLike');
const Relationship = require('../models/relationship');
const User = require('../models/user');
const Bookmark = require('../models/bookmark');
const get_date = require('../modules/get_date');
const upload_image = require('../modules/upload_image');
const get_hashtags = require('../modules/get_hashtags');
const get_avatars = require('../modules/get_avatars');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;
const http = require('http');
const formidable = require('formidable');

// create a post to upload images
module.exports.create_image_post = (req, res) => {
  if(!req.headers) return;
  // check user is logged in
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }

  upload_image(req, res, user, function(dir, names) {
    if(!req.body.title || !req.body.caption || names == []) {
      var imageDir = './public/images/'+user._id+'/posts/'+dir;
      removePostDir(imageDir);
    }
    if(!req.body.title) {
      res.send({success: false, msg: 'Error: title is undefined'});
      return;
    }
    if(!req.body.caption) {
      res.send({success: false, msg: 'Error: caption is undefined.'});
      return;
    }
    var post = new Post({
      userId: user._id,
      username: user.username,
      title: req.body.title,
      content: req.body.caption,
      dir: dir,
      images: names,
      hashtags: []
    });
    post.hashtags = get_hashtags(post.content);
    post.save((err) => {
      Post.count({userId: user._id}, (err, c) => {
        User.update({_id: user._id}, {posts: c}, (err) => {
          if(err) res.send(err);
          else res.send({success: true, msg: 'Posted new image.'});
        });
      });
    });
  }); // end upload_image()
};

// upload to post a video
module.exports.create_video_post = (req, res) => {
  if(!req || !req.headers) return;
  console.log('no.1');
  // check user is logged in
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  }

  var form = new formidable.IncomingForm();
  var date = Date.now();
  var dest = './public/images/'+user._id+'/posts/'+date+'/';
  var success = false;

  form.maxFileSize = 2000 * 1024 * 1024;
  form.parse(req, function(err, fields, files) {
    console.log('fields='+JSON.stringify(fields));
    console.log('files='+JSON.stringify(files));

    if(!files['video']) {
      res.send({success: false, msg: 'Error: video is undefined.'});
      return;
    }

    if(!fields.title) {
      //removePostDir(dest);
      res.send({success: false, msg: 'Error: title is undefined.'});
      return;
    }

    if(!fields.caption) {
      //removePostDir(dest);
      res.send({success: false, msg: 'Error: caption is undefined.'});
      return;
    }

    var post = new Post({
      userId: user._id,
      username: user.username,
      title: fields['title'],
      content: fields['caption'],
      dir: date,
      images: [],
      hashtags: [],
      video: files['video'].name
    });
    post.hashtags = get_hashtags(post.content);
    post.save((err) => {
      Post.count({userId: user._id}, (err, c) => {
        User.update({_id: user._id}, {posts: c}, (err) => {
          if(err) res.send({success: false, msg: err});
          else res.send({success: true, msg: 'Posted a new video.'});
        });
      });
    });
  });

  form.on('fileBegin', (name, file) => {
    console.log('fileBegin:file='+JSON.stringify(file));
    if(!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    file.path = dest+file.name;
  });

  form.on('file', (name, file) => {
    console.log('Uploaded ' + dest+file.name);
  });

  form.on('end', () => {
  });
};

function update_user(id, cb) {
  Post.count({userId: id}, (err, postC) => {
    Like.count({userId: id}, (err, likeC) => {
      Bookmark.count({userId: id}, (err, bookmarkC) => {
        User.findOneAndUpdate({_id: id}, {posts: postC, likes: likeC, bookmarks: bookmarkC}, (err) => {
          cb(postC, likeC, bookmarkC);
        });
      });
    });
  });
}

module.exports.clean_up = (req, res) => {
  var username = req.params.username;
  User.findOne({username: username}, async (err, user) => {
    var userId = user._id;
    console.log('user='+user._id);
    try {
      // remove likes if the post does not exist
      await Like.find({userId: userId}, async (err, rows) => {
        await rows.forEach(async (row, i) => {
          var c = await Post.count({_id: row.postId});
          if(c == 0) {
            await Like.findOneAndRemove({userId: userId, postId: row.postId});
          }
        });
      });
      await CommentLike.find({userId: userId}, async (err, rows) => {
        await rows.forEach(async (row, i) => {
          var c = await Comment.count({_id: row.postId});
          if(c == 0) {
            await CommentLike.findOneAndRemove({userId: userId, postId: row.postId});
          }
        });
      });
      await Bookmark.find({userId: userId}, async (err, rows) => {
        await rows.forEach(async (row, i) => {
          var c = await Post.count({_id: row.postId});
          if(c == 0) {
            await Bookmark.findOneAndRemove({userId: userId, postId: row.postId});
          }
        });
      });
      update_user(userId, function() {
        res.redirect('/user/'+username);
      });
    } catch(e) {
      console.log('err: '+e);
    }
  });
};

function removePostDir(path) {
  if(fs.existsSync(path)) {
    console.log('exists='+path);
    fs.readdirSync(path).forEach(function(content, index) {
      var filePath = path + '/' + content;
      fs.unlinkSync(filePath);
    });
    fs.rmdirSync(path);
  } else {
    console.log('not exists='+path);
  }
}
