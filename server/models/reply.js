var mongoose = require('mongoose');

var schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  username: {
    type: String,
    required: true
  },

  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  title: {
    type: String,
    required: false
  },

  content: {
    type: String,
    required: true
  },

  likes: {
    type: Number,
    require: true,
    default: 0
  },

  dislikes: {
    type: Number,
    require: true,
    default: 0
  },

  liked: {
    type: Boolean,
    require: true,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reply', schema);
