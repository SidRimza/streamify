const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a stream title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  streamUrl: {
    type: String,
    required: [true, 'Please provide a stream URL']
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  isLive: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  },
  viewerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stream', streamSchema);
