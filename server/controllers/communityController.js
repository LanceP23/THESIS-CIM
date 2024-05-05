const Community = require('../models/community');
const User = require('../models/user');
const MobileUser = require('../models/mobileUser');

// Controller function to build a new community
const buildCommunity = async (req, res) => {
    try {

  
      const { name, description, logo, onModel, members: membersString } = req.body;
  
      // Parse the members field as JSON
      const members = JSON.parse(membersString);
  
      // Check if the community name already exists
      const existingCommunity = await Community.findOne({ name });
      if (existingCommunity) {
        return res.status(400).json({ error: 'Community name already exists' });
      }
  
      if (!members || members.length === 0) {
        return res.status(400).json({ error: 'Members list is required' });
      }
  
  
      // Validate members and fetch their details (name and email)
      for (const member of members) {
        const { userId, userType } = member;
        if (!userId || !userType) {
          return res.status(400).json({ error: 'Each member must have a user ID and type' });
        }
  
        // Fetch user details
        let user;
        if (userType === 'User') {
            user = await User.findById(userId);
            if (!user) {
            return res.status(404).json({ error: 'User not found' });
            }
            member.name = user.name;
            member.adminType = user.adminType || ''; // Include adminType if available, otherwise empty string
            member.userId = user._id; // Set userId for the member
        } else if (userType === 'MobileUser') {
            user = await MobileUser.findById(userId);
            if (!user) {
            return res.status(404).json({ error: 'MobileUser not found' });
            }
            member.name = user.name;
        }
        }
  
      // Get the authenticated user (creator)
      const creator = req.user;
      
  
      // Add the creator as admin
      const creatorMember = { userId: creator.id, name: creator.name, userType: 'User', adminType: creator.adminType || '', role: 'admin' };
        members.push(creatorMember);
        

        
  
      // Create the community
      const newCommunity = new Community({
        name,
        description,
        logo,
        members,
        onModel
      });
      await newCommunity.save();
  
      res.status(201).json({
        name: newCommunity.name,
        description: newCommunity.description,
        logo: newCommunity.logo,
        members: newCommunity.members,
        onModel: newCommunity.onModel
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
const fetchUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const fetchMobileUsers = async (req, res) => {
    try {
      const mobileUsers = await MobileUser.find();
      res.json(mobileUsers);
    } catch (error) {
      console.error('Error fetching mobile users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getAllCommunities = async (req, res) => {
    try {
      // Fetch all communities
      const communities = await Community.find();
      res.status(200).json(communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getCommunityById = async (req, res) => {
    try {
      const userId = req.user.id; 
  
      // Fetch communities where the current user is an admin
      const communities = await Community.find({ 'members.userId': userId, 'members.role': 'admin' });
  
      res.status(200).json(communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports = {
  buildCommunity,
  fetchMobileUsers,
  fetchUsers,
  getAllCommunities,
  getCommunityById
};
