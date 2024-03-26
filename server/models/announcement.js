// announcementModel.js

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
  media: {
    data: Buffer, // Store the binary data of the file
    contentType: String // Store the MIME type of the file
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
