const MobileUser = require('../models/mobileUser')

const getMobileUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await MobileUser.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllMobileUsers = async (req, res) => {
    try {
        const users = await MobileUser.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateMobileUserById = async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;
    try {
        const user = await MobileUser.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteMobileUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await MobileUser.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports={
    getMobileUserById,
    getAllMobileUsers,
    updateMobileUserById,
    deleteMobileUserById

}