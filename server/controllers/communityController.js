const Community = require('../models/community');
const User = require('../models/user');
const MobileUser = require('../models/mobileUser');
const Announcement = require('../models/announcement');
const {mongoose} = require('mongoose');
const { post } = require('../routes/authRouter');

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

  const getCommunityName = async (req, res) => {
    try {
      const communityId = req.params.communityId;
      // Assuming you have a Community model with a name field
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      res.status(200).json({ name: community.name });
    } catch (error) {
      console.error('Error fetching community name:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getAnnouncementsByCommunityId = async (req, res) => {
    try {
      const { communityId } = req.params;
      // Fetch announcements filtered by community ID
      const announcements = await Announcement.find({ communityId });
      res.status(200).json(announcements);
    } catch (error) {
      console.error('Error fetching announcements by community ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  const getRandomAnnouncementsByAdminCommunities = async (req, res) => {
    try {
        // Get the name of the logged-in admin user
        const adminName = req.user.name;

        // Find all communities where the logged-in user is an admin
        const adminCommunities = await Community.find({
            'members.name': adminName, // Find communities where the admin's name matches
            'members.role': 'admin'
        });

        let announcements;

        if (adminCommunities.length === 1) {
            // If the admin is a member of only one community, fetch all announcements for that community
            const community = adminCommunities[0];
            announcements = await Announcement.find({ communityId: community._id });
            announcements = announcements.map(announcement => ({ announcement, community }));
        } else {
            // If the admin is a member of multiple communities, fetch a random announcement for each community
            announcements = await Promise.all(adminCommunities.map(async (community) => {
                // Get the total number of announcements for the community
                const totalAnnouncements = await Announcement.countDocuments({ communityId: community._id });
                // If there are no announcements, return null
                if (totalAnnouncements === 0) {
                    return null;
                }
                // Generate a random number within the total number of announcements
                const randomIndex = Math.floor(Math.random() * totalAnnouncements);
                // Find a random announcement based on the random index
                const randomAnnouncement = await Announcement.findOne({ communityId: community._id }).skip(randomIndex);
                return { announcement: randomAnnouncement, community };
            }));
        }

        // Filter out null values in case some communities have no announcements
        const filteredAnnouncements = announcements.filter(item => item !== null);

        res.status(200).json(filteredAnnouncements);
    } catch (error) {
        console.error('Error fetching random announcements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getAnnouncementCommunityMembers = async (req, res) => {
  try {
    // Get the name of the logged-in user
    const userName = req.user.name;

    // Find all communities where the logged-in user is a member
    const memberCommunities = await Community.find({
      'members': { $elemMatch: { name: userName, role: 'member' } }
    });

    // Function to retrieve a random announcement for a given community
    const getRandomAnnouncement = async (community) => {
      const totalAnnouncements = await Announcement.countDocuments({ communityId: community._id });
      const randomIndex = Math.floor(Math.random() * totalAnnouncements);
      return Announcement.findOne({ communityId: community._id }).skip(randomIndex);
    };

    let announcements;

    if (memberCommunities.length === 1) {
      // If the user is a member of only one community, fetch all announcements for that community
      const community = memberCommunities[0];
      const communityAnnouncements = await Announcement.find({ communityId: community._id });
      announcements = communityAnnouncements.map(announcement => ({ announcement, community }));
    } else {
      // If the user is a member of multiple communities, fetch a random announcement for each community
      announcements = await Promise.all(memberCommunities.map(async (community) => {
        const randomAnnouncement = await getRandomAnnouncement(community);
        return { announcement: randomAnnouncement, community };
      }));
    }

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeMemberFromCommunity = async (req, res) => {
  try {
      const { communityId, memberId } = req.params;

      const community = await Community.findById(communityId);
      if (!community) {
          return res.status(404).json({ error: 'Community not found' });
      }

      const memberIndex = community.members.findIndex(
          (member) => member.userId.toString() === memberId
      );

      if (memberIndex === -1) {
          return res.status(404).json({ error: 'Member not found in the community' });
      }
      community.members.splice(memberIndex, 1);

      // Save the updated community
      await community.save();

      res.status(200).json({ message: 'Member removed successfully', community });
  } catch (error) {
      console.error('Error removing member from community:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getForumPostsByCommunityId = async (req, res) => { 
  try {
    const { communityId } = req.params;

    // Construct the query to check for both ObjectId and string
    const query = {
      $or: [
        { communityId: new mongoose.Types.ObjectId(communityId) }, // Match ObjectId
        { communityId: communityId } // Match string
      ]
    };

    // Fetch posts from 'forumposts' collection based on the constructed query
    const forumPosts = await mongoose.connection.db.collection('forumposts')
      .find(query)
      .sort({ datePosted: -1 })
      .toArray();

    // Handle the case where no posts were found
    if (forumPosts.length === 0) {
      return res.status(404).json({ message: 'No forum posts found for this community.' });
    }

    // Return the forum posts
    res.status(200).json(forumPosts);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLast5ForumPostsWithCommunityName = async (req, res) => {
  try {
    // Fetch the last 5 forum posts
    const forumPosts = await mongoose.connection.db.collection('forumposts')
      .find({})
      .sort({ datePosted: -1 })
      .limit(5)
      .toArray();

    // If no forum posts found
    if (forumPosts.length === 0) {
      return res.status(404).json({ message: 'No forum posts found.' });
    }

    // Fetch the community names for each post
    const postsWithCommunityName = await Promise.all(forumPosts.map(async (post) => {
      const community = await Community.findById(post.communityId); // Fetch the community by ID
      return {
        ...post,
        communityName: community ? community.name : 'Unknown Community', // Add community name
        logo: community ? community.logo : null
      };
    }));
    // Return the forum posts with community names
    res.status(200).json(postsWithCommunityName);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const deleteForumPost = async (req, res) => {
  try {
    const { communityId, postId } = req.params;

    // Delete the post from the 'forumposts' collection
    const result = await mongoose.connection.db.collection('forumposts').deleteOne({
      _id: new mongoose.Types.ObjectId(postId),  
      communityId: communityId 
    });

    // If no post is found or deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Forum post not found or not associated with this community' });
    }

    // Respond with success
    res.status(200).json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ message: 'Failed to delete forum post' });
  }
};






const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Delete the community itself
    const community = await Community.findByIdAndDelete(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Delete associated announcements
    await Announcement.deleteMany({ communityId });

    // Delete associated forum posts
    await mongoose.connection.db.collection('forumposts').deleteMany({ communityId });

    // Add other deletion logic for related data if needed

    res.status(200).json({ message: 'Community and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addMember = async (req, res) => {
  try {
    const { communityId, userId, userType } = req.body;

    // Validate input
    if (!communityId || !userId || !userType) {
      return res.status(400).json({ error: 'Community ID, User ID, and User Type are required.' });
    }

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found.' });
    }

    // Check if the user is already a member
    const existingMember = community.members.find((member) => member.userId.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this community.' });
    }

    // Fetch the user details based on userType
    let user;
    if (userType === 'User') {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
    } else if (userType === 'MobileUser') {
      user = await MobileUser.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'MobileUser not found.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid user type.' });
    }

    // Prepare the member object to add
    const newMember = {
      userId: user._id,
      name: user.name,
      userType,
      adminType: user.adminType || '', // Optional: Include adminType if available
    };

    // Add the member to the community
    community.members.push(newMember);
    await community.save();

    res.status(200).json({
      message: 'Member added successfully.',
      communityId: community._id,
      newMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};








module.exports = {
  buildCommunity,
  fetchMobileUsers,
  fetchUsers,
  getAllCommunities,
  getCommunityById,
  getCommunityName,
  getAnnouncementsByCommunityId,
  getRandomAnnouncementsByAdminCommunities,
  getAnnouncementCommunityMembers,
  removeMemberFromCommunity,
  getForumPostsByCommunityId,
  getLast5ForumPostsWithCommunityName,
  deleteCommunity,
  deleteForumPost,
  addMember
};
