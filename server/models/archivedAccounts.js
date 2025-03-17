const mongoose = require('mongoose');

const archivedAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  archivedAt: {
    type: Date,
    default: Date.now,
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
});

const ArchivedAccount = mongoose.model('ArchivedAccount', archivedAccountSchema);

module.exports = ArchivedAccount;
