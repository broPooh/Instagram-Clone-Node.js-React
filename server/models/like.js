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
}, {
    timestamps: true
});

module.exports = mongoose.model('Like', schema);
