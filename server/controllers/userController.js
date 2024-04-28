const User = require('../models/user');

const getUsersForSidebar = async (req,res)=>{
    try {
        
        const loggedInUserId = req.user.id
        
        const filteredUsers = await User.find({_id:{$ne: loggedInUserId}}).select("-password");
        
        res.json(filteredUsers);
        
    } catch (error) {
        console.error(error.message)
        res.status(500).json({error: "Internal server error"})
    }
}

const getUserById = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Failed to fetch user details' });
    }
  };

module.exports ={
    getUsersForSidebar,
    getUserById
}