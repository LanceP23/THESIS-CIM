const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  type: {
    type: String,
    enum: ['event', 'announcement', 'message', 'other'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  posterName: {
    type: String,
    required: true,
  },
  announcementHeader: {
    type: String,
    required: true,
  },
  announcementBody:{
    type: String,
  },
  mediaLink:{
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  eventName: {
    type: String,
  },
  organizerName: {
    type: String,
  },
  timeStart:{
    type: Date,
  },
  timeEnd:{
    type: Date
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
