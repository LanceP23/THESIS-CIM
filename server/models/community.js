const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommunitySchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    logo: {
      type: String, 
      trim: true
    },
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
      },
      name: {
        type: String,
        required: true
      },
      userType: {
        type: String,
        required: true,
        enum: ['MobileUser', 'User']
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
      },
      adminType: String 
    }],
    onModel: {
      type: String,
      required: true,
      enum: ['MobileUser', 'User']
    }
  });
  

const Community = mongoose.model('Community', CommunitySchema);
module.exports = Community;
