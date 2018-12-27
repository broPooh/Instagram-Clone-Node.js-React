const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Relationship = require('../models/relationship');
const jwt = require('jsonwebtoken');
const secret = require('../modules/config').secret;

// get following by user
router.get('/following', (req, res) => {
  jwt.verify(req.headers.authorization, secret, (err, account) => {
    var userId = req.query.userId;
    Relationship.find({followerId: userId}, async(err, rows) => {
      var users = [];
      for(var i=0; i<rows.length; i++) {
        var u = await User.findOne({_id: rows[i].followedId}).exec();
        if(u != null) {
          if(account) {
            var c = await Relationship.count({followerId: account._id, followedId: u._id});
            if(c) u.followed = true;
          }
          users.push(u);
        }
        else await Relationship.findOneAndRemove({followerId: userId, followedId: rows[i].followedId}).exec();
      }
      res.send({success: true, users: users});
    });
  });

});

// get followers at user
router.get('/followers', (req, res) => {
  jwt.verify(req.headers.authorization, secret, (err, account) => {
    var userId = req.query.userId;
    Relationship.find({followedId: userId}, async(err, rows) => {
      var users = [];
      for(var i=0; i<rows.length; i++) {
        var u = await User.findOne({_id: rows[i].followerId}).exec();
        if(u != null) {
          if(account) {
            var c = await Relationship.count({followerId: account._id, followedId: u._id});
            if(c) u.followed = true;
          }
          users.push(u);
        }
        else await Relationship.findOneAndRemove({followerId: rows[i].followerId, followedId: userId}).exec();
      }
      res.send({success: true, users: users});
    });
  });
});

router.get('/followed', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    var obj = {
      followerId: user._id,
      followedId: req.query.followedId
    }
    console.log('followedId='+req.query.followedId);
    Relationship.count(obj, (err, c) => {
      if(err) res.send(err);
      if(c == 0) res.send({success: true, followed: false});
      else if(c > 0) res.send({success: true, followed: true});
    });
  }
});

router.post('/follow', (req, res) => {
  var user = jwt.verify(req.headers.authorization, secret);
  if(!user) {
    res.send({success: false, msg: 'Not authorized.'});
    return;
  } else {
    User.findOne({username: req.body.username}, (err, row) => {
      if(err) res.send({success: 'false', msg: err});
      var obj = {
        followerId: user._id,
        followedId: row.id
      };
      if(user._id == row.id) {
        res.send({success: false, msg: 'Error: User can not follow same user.'});
        return;
      }
      Relationship.count(obj, (err, c) => {
        if(err) res.send({success: 'false', msg: err});
        else if(c == 0) {
          // follow
          console.log('follow');
          obj = new Relationship(obj);
          obj.save((err) => {
            if(err) res.send(err);
            else {
              update_counts(obj, function(counts) {
                res.send({
                  success: true,
                  followed: true,
                  following: counts.following,
                  followers: counts.followers
                });
                console.log('log=followed');
              });
            }
          });
        } else {
          // unfollow
          console.log('unfollow');
          Relationship.findOneAndRemove(obj, (err) => {
            if(err) res.send({success: false, msg: 'Relationship.findOneAndRemove()='+err});
            else {
              update_counts(obj, function(counts) {
                res.send({
                  success: true,
                  followed: false,
                  following: counts.following,
                  followers: counts.followers
                });
                console.log('log=unfollowed');
              });
            }
          });
        }
      });
    });
  }
});

async function update_counts(obj, cb) {
  var userId = obj.followerId;
  Relationship.count({followerId: userId}, (err, following) => {
    if(err) following = 0;
    User.update({_id: userId}, {following: following}, (err) => {
      Relationship.count({followedId: obj.followedId}, (err, followers) => {
        if(err) followers = 0;
        User.update({_id: obj.followedId}, {followers: followers}, (err) => {
          cb({
            following: following,
            followers: followers
          });
        });
      });
    });
  });
}

module.exports = router;
