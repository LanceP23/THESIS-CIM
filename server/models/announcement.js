const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String 
  },
  contentType: {
    type: String 
  },
  postedBy:{
    type:String,
    required:true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
