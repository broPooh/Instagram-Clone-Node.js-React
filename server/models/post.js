var mongoose = require('mongoose');

var schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  username: {
    type: String,
    required: true,
    default: ''
  },

  title: {
    type: String,
    required: true,
    default: ''
  },

  content: {
    type: String,
    required: true,
    default: ''
  },

  dir: {
    type: String,
    required: true,
    default: ''
  },

  images: {
    type: Array,
    required: true,
    default: [String]
  },

  video: {
    type: String,
    required: false,
    default: ''
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

  comments: {
    type: Number,
    require: true,
    default: 0
  },

  bookmarks: {
    type: Number,
    require: true,
    default: 0
  },

  hashtags: {
    type: Array,
    require: false,
    default: [String]
  },

  liked: {
    type: Boolean,
    require: true,
    default: false
  },

  bookmarked: {
    type: Boolean,
    require: true,
    default: false
  },

  time: {
    type: Number,
    require: true,
    default: 0
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', schema);
