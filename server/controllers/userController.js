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

module.exports ={
    getUsersForSidebar
}