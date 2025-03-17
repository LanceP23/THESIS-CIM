const mongoose = require('mongoose');

// Define the MinigameShopItem schema
const MinigameShopItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, 
  },
  picture: {
    type: String, 
    required: true,
  },
}, {
  timestamps: true, 
});


const MinigameShopItem = mongoose.model('MinigameShopItem', MinigameShopItemSchema);

module.exports = MinigameShopItem;
