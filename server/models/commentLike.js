var mongoose = require('mongoose');

var schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  dislike: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('CommnetLike', schema);
