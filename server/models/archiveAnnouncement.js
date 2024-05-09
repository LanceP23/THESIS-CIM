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
