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
  posterId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community', 
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  visibility: {
    everyone: { type: Boolean, default: false },
    staff: { type: Boolean, default: false },
    faculty: { type: Boolean, default: false },
    students: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'scheduled', 'expired'],
    default: 'pending',
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

announcementSchema.pre('save', function(next) {
  if (this.postingDate && this.expirationDate <= this.postingDate) {
    return next(new Error('Expiration date must be after posting date'));
  }
  next();
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
