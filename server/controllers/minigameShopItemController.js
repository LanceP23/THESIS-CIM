const MinigameShopItem = require('../models/minigameShopItem');

// Controller for managing MinigameShopItems
const MinigameShopController = {
  // Get all items
  getAllItems: async (req, res) => {
    try {
      const items = await MinigameShopItem.find();
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      res.status(500).json({ message: 'Failed to fetch items.' });
    }
  },

  // Get a single item by ID
  getItemById: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await MinigameShopItem.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found.' });
      }
      res.status(200).json(item);
    } catch (error) {
      console.error('Error fetching shop item:', error);
      res.status(500).json({ message: 'Failed to fetch the item.' });
    }
  },

  // Create a new item
  createItem: async (req, res) => {
    try {
      const { name, price, picture } = req.body;

      if (!name || !price || !picture) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const newItem = new MinigameShopItem({ name, price, picture });
      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (error) {
      console.error('Error creating shop item:', error);
      res.status(500).json({ message: 'Failed to create the item.' });
    }
  },

  // Update an item
  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, picture } = req.body;

      const updatedItem = await MinigameShopItem.findByIdAndUpdate(
        id,
        { name, price, picture },
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found.' });
      }

      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating shop item:', error);
      res.status(500).json({ message: 'Failed to update the item.' });
    }
  },

  // Delete an item
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedItem = await MinigameShopItem.findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found.' });
      }

      res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
      console.error('Error deleting shop item:', error);
      res.status(500).json({ message: 'Failed to delete the item.' });
    }
  },
};

module.exports = MinigameShopController;
