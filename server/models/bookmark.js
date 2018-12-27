var mongoose = require('mongoose');

var schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bookmark', schema);
