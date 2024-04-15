const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  organizerType: {
    type: String,
    required: true
  },
  organizerName: {
    type: String,
    required: true
  },
  participants: [{
    name: String,
    section: String,
    type: String,
    members: [String]
  }],
  committee: String,
  committeeChairman: String,
  location: String,
  budget: String
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
