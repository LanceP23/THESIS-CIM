const mongoose = require('mongoose');

const archiveAnnouncementSchema = new mongoose.Schema({
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
  postedBy: {
    type: String,
    required: true
  },
  posterId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
  },
  visibility: {
    everyone: { type: Boolean, default: false },
    staff: { type: Boolean, default: false },
    faculty: { type: Boolean, default: false },
    students: { type: Boolean, default: false }
  },
  postingDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
    required: true
  },dislikes: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  minigame: {
    type: String,
    enum: ['CIM Wordle', 'Coming Soon','Flappy CIM'], // add games nlng
    default: null
  },
  minigameWord: {
    type: String,
    validate: {
      validator: function (v) {
        // Only validate if minigame is "CIM Wordle"
        return this.minigame !== 'CIM Wordle' || (v && v.length === 5);
      },
      message: 'The word must be exactly 5 letters for CIM Wordle.'
    }
  },
  status: {
    type: String,
    default: 'archived' // Assuming the default status for archived announcements is 'archived'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ArchiveAnnouncement = mongoose.model('ArchiveAnnouncement', archiveAnnouncementSchema);

module.exports = ArchiveAnnouncement;
