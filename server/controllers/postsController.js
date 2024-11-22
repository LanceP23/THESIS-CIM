const Announcement = require('../models/announcement');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const axios = require('axios');
const { getReceiverSocketId, io } = require('../socketManager');
const Organization = require('../models/organization');
const MobileUser = require('../models/mobileUser');
const Notification = require('../models/notification');  
const Community = require('../models/community');
const PostComments = require('../models/postComments');




// req auth
const authenticate = async (req, res, next) => {
  try {
    // Check if authentication token exists in request headers
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    }

    
    const token = authToken.split(' ')[1]; 
    console.log('Received token:', token);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
    }

    
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    
    req.user = user;
r
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create Announcement
const createAnnouncement = async (req, res) => { 
  try {
    const {
      header,
      body,
      mediaUrl,
      visibility,
      postingDate,
      expirationDate,
      communityId,
      organizationId,
      minigame,        
      minigameWord,   
    } = req.body;

    let contentType = null;
    let status = 'pending';

    // Determine status based on admin type and posting date
    if (req.user.adminType === 'School Owner') {
      if (postingDate && new Date(postingDate) > new Date()) {
        status = 'scheduled'; // Scheduled posts will be approved later by the cron job
      } else {
        status = 'approved'; // Immediately approved if no posting date or posting date is now
      }
    }

    // Set contentType based on file or media URL
    if (req.file && req.file.mimetype) {
      contentType = req.file.mimetype;
    }

    if (mediaUrl) {
      const response = await axios.head(mediaUrl);
      const contentTypeFromUrl = response.headers['content-type'];
      if (contentTypeFromUrl) {
        contentType = contentTypeFromUrl;
      }
    }

    // Validate minigameWord if minigame is "CIM Wordle"
    if (minigame === 'CIM Wordle' && (!minigameWord || minigameWord.length !== 5)) {
      return res.status(400).json({ error: 'The minigame word must be exactly 5 letters for CIM Wordle.' });
    }

    // Prepare the announcement data
    const announcementData = {
      header,
      body,
      mediaUrl,
      contentType,
      status,
      postedBy: req.user.name,
      posterId: req.user.id,
      visibility: JSON.parse(visibility),
      postingDate,
      expirationDate,
      minigame: minigame || null,          
      minigameWord: minigameWord || null   
    };

    // Add optional fields
    if (communityId) {
      announcementData.communityId = communityId;
    }

    if (organizationId) {
      announcementData.organizationId = organizationId;
    }

    // Create and save the announcement
    const announcement = new Announcement(announcementData);
    await announcement.save();

    let targetUsers = [];
    let recipientIds = new Set(); // Use a Set to avoid duplicates

    const parsedVisibility = JSON.parse(visibility);
    const allMobileUsers = await MobileUser.find();

    // Determine target users based on visibility settings
    if (parsedVisibility.everyone) {
      const allUsers = await User.find();
      targetUsers.push(...allUsers, ...allMobileUsers);
    } else {
      if (parsedVisibility.staff) {
        const staffUsers = await User.find({ position: { $exists: false }, organization: { $exists: false }, department: { $exists: false } });
        targetUsers.push(...staffUsers, );
      }
      if (parsedVisibility.faculty) {
        const facultyUsers = await User.find({ department: { $exists: true } });
        targetUsers.push(...facultyUsers, );
      }
      if (parsedVisibility.students) {
        const studentUsers = await User.find({ position: { $exists: true }, organization: { $exists: true } });
        targetUsers.push(...studentUsers, ...allMobileUsers);
      }
    }

    // Add target users to recipientIds
    targetUsers.forEach(user => recipientIds.add(user._id.toString()));

    // Prepare notification data template
    const notificationDataTemplate = {
      type: 'announcement',
      message: 'New announcement posted',
      posterName: req.user.name,
      announcementHeader: header,
      announcementBody: body,
      timestamp: new Date().toISOString(),
      recipientIds: Array.from(recipientIds), // Convert Set to Array
    };

    // If no postingDate (real-time post), send the notification right away
    if (!postingDate || new Date(postingDate) <= new Date()) {
      // Create and save notification
      const notification = new Notification(notificationDataTemplate);
      await notification.save();

      // Emit notifications to connected users
      targetUsers.forEach(user => {
        const receiverSocketId = getReceiverSocketId(user._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newAnnouncement", notificationDataTemplate);
        }
      });
    }

    // Handle community-specific notifications if a communityId is provided
    if (communityId) {
      const communityMembers = await Community.findById(communityId).populate({
        path: 'members.userId',
        model: 'User'
      });
      const communityMobileMembers = await Community.findById(communityId).populate({
        path: 'members.userId',
        model: 'MobileUser'
      });

      const communityRecipientIds = new Set();

      if (communityMembers) {
        communityMembers.members
          .filter(member => member.userId) // Ensure userId is not null
          .forEach(member => communityRecipientIds.add(member.userId._id.toString()));
      }

      if (communityMobileMembers) {
        communityMobileMembers.members
          .filter(member => member.userId) // Ensure userId is not null
          .forEach(member => communityRecipientIds.add(member.userId._id.toString()));
      }

      // Remove duplicates between general and community-specific recipients
      communityRecipientIds.forEach(id => recipientIds.delete(id));

      const communityNotificationData = {
        ...notificationDataTemplate,
        message: 'New announcement posted in your community',
        recipientIds: Array.from(communityRecipientIds), // Convert Set to Array
      };

      const communityNotification = new Notification(communityNotificationData);
      await communityNotification.save();

      communityRecipientIds.forEach(id => {
        const receiverSocketId = getReceiverSocketId(id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newCommunityAnnouncement", communityNotificationData);
        }
      });
    }

    // Respond with the created announcement
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement or notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};













//fetch pending announcement
const getPendingAnnouncements = async (req, res) => {
  try {
    const pendingAnnouncements = await Announcement.find({ status: 'pending' });
    res.json(pendingAnnouncements);
  } catch (error) {
    console.error('Error fetching pending announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//update Status upon approval
const updateAnnouncementStatus = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { status, reason } = req.body;
    

    const rejectionReason = reason;
    const authToken = req.headers.authorization;

    // Check if the authorization header is present
    if (!authToken) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract the token from the authorization header
    const token = authToken.split(' ')[1];

    // Verify and decode the token to get user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find the user associated with the token
    const user = await User.findOne({ studentemail: decodedToken.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const announcement = await Announcement.findById(announcementId).exec();
    console.log(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Update announcement status
    announcement.status = status;
    await announcement.save();

    if (status === 'rejected') {
      // Find the user who posted the announcement using posterId
      const postingUser = await User.findById(announcement.posterId);
      if (postingUser) {
        const receiverSocketId = getReceiverSocketId(postingUser._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('announcementRejected', {
            type: 'announcement',
            message: `Your announcement titled "${announcement.header}" has been rejected.`,
            reason: rejectionReason, // Only included if rejected
            postStatus: 'rejected',
            announcementId: announcementId
          });
    
          const newNotification = new Notification({
            type: 'postStatus',
            message: `Your announcement titled "${announcement.header}" has been rejected.`,
            postStatus: 'rejected',  // Store post status as 'rejected'
            rejectionReason: rejectionReason, // Store rejection reason
            recipientIds: [postingUser._id],
            posterName: postingUser.name, // Assuming 'name' is stored in the User model
            announcementHeader: announcement.header,
            announcementId: announcementId
          });
          await newNotification.save();
        }
      }
    } else if (status === 'approved') {
      // Find the user by their posterId
      const postingUser = await User.findById(announcement.posterId);
      if (postingUser) {
        // Emit a socket event to the user who created the announcement
        const receiverSocketId = getReceiverSocketId(postingUser._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('announcementApproved', {
            type: 'announcement',
            message: `Your announcement titled "${announcement.header}" has been approved.`,
            announcementId: announcementId,
            postStatus: 'approved'
          });
    
          // Store the notification in the database
          const newNotification = new Notification({
            type: 'postStatus',
            message: `Your announcement titled "${announcement.header}" has been approved.`,
            postStatus: 'approved',  // Store post status as 'approved'
            recipientIds: [postingUser._id], // Note the array
            posterName: postingUser.name, // Assuming 'name' is stored in the User model
            announcementHeader: announcement.header,
            announcementId: announcementId
          });
          await newNotification.save();
        }
      }
    
    

      // Emit and store notifications for normal announcements
      if (!announcement.organizationId && !announcement.communityId) {
        // Set visibility to everyone if no organizationId or communityId is provided
        announcement.visibility = { everyone: true };
        await announcement.save();

        // Fetch all users and mobile users to send notifications
        const allUsers = await User.find();
        const allMobileUsers = await MobileUser.find();
        const allUsersCombined = [...allUsers, ...allMobileUsers];

        for (const user of allUsersCombined) {
          const receiverSocketId = getReceiverSocketId(user._id.toString());
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newAnnouncement", {
              type: "announcement",
              message: "New announcement posted",
              posterName: announcement.postedBy, // Send posterId here
              announcementHeader: announcement.header,
              timestamp: new Date().toISOString()
            });
          } else {
            console.log(`No valid socket ID found for user ID: ${user._id}. User may not be connected.`);
          }
        }

        // Store the notification in the database
        const allUserIds = allUsersCombined.map(user => user._id);
        const newNotification = new Notification({
          type: 'announcement',
          message: 'New announcement posted',
          recipientIds: allUserIds, // Note the array
          posterName: announcement.postedBy, // Send posterId here
          announcementHeader: announcement.header,
          announcementId: announcement._id
        });
        await newNotification.save();
      } else {
        try {
          if (announcement.organizationId) {
            // Find the organization by ID
            const organization = await Organization.findById(announcement.organizationId);

            if (!organization) {
              console.log("Organization not found");
              return; // Return early if organization not found
            }

            // Fetch the list of members and mobile members for the organization
            const organizationUsers = await User.find({ _id: { $in: organization.members } });
            const organizationMobileUsers = await MobileUser.find({ _id: { $in: organization.mobileMembers } });
            const allOrganizationMembers = [...organizationUsers, ...organizationMobileUsers];

            if (allOrganizationMembers.length === 0) {
              console.log("No users found for this organization. Organization may have no members.");
              return; // Return early if no users found for organization
            }

            // Emit notifications to each member of the organization
            for (const user of allOrganizationMembers) {
              const receiverSocketId = getReceiverSocketId(user._id.toString());
              if (receiverSocketId) {
                io.to(receiverSocketId).emit("newOrganizationAnnouncement", {
                  type: "announcement",
                  message: "New announcement posted in your organization",
                  posterName: announcement.postedBy, // Send posterId here
                  announcementHeader: announcement.header,
                  timestamp: new Date().toISOString()
                });
              } else {
                console.log(`No valid socket ID found for user ID: ${user._id}. User may not be connected.`);
              }
            }

            // Store the notification in the database
            const organizationMemberIds = allOrganizationMembers.map(user => user._id);
            const newNotification = new Notification({
              type: 'announcement',
              message: 'New announcement posted in your organization',
              recipientIds: organizationMemberIds, // Note the array
              posterName: announcement.postedBy, // Send posterId here
              announcementHeader: announcement.header,
              announcementId: announcement._id
            });
            await newNotification.save();
          } else if (announcement.communityId) {
            // Fetch the list of members for the community
            const community = await Community.findById(announcement.communityId);
            const communityMembers = community.members;

            if (communityMembers.length === 0) {
              console.log("No users found for this community. Community may have no members.");
              return; // Return early if no users found for community
            }

            // Emit notifications to each member of the community
            for (const member of communityMembers) {
              const receiverSocketId = getReceiverSocketId(member.userId.toString());
              if (receiverSocketId) {
                io.to(receiverSocketId).emit("newCommunityAnnouncement", {
                  type: "announcement",
                  message: "New announcement posted in your community",
                  posterName: announcement.postedBy, // Send posterId here
                  announcementHeader: announcement.header,
                  timestamp: new Date().toISOString()
                });
              } else {
                console.log(`No valid socket ID found for user ID: ${member.userId}. User may not be connected.`);
              }
            }

            // Store the notification in the database
            const communityMemberIds = communityMembers.map(member => member.userId);
            const newNotification = new Notification({
              type: 'announcement',
              message: 'New announcement posted in your community',
              recipientIds: communityMemberIds, // Note the array
              posterName: announcement.postedBy, // Send posterId here
              announcementHeader: announcement.header,
              announcementId: announcement._id
            });
            await newNotification.save();
          }
        } catch (error) {
          console.error("Failed to retrieve organization or community or emit announcements due to an error:", error);
        }
      }
    }

    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





//announcement approved
const getApprovedAnnouncements = async (req, res) => {
  try {
    const approvedAnnouncements = await Announcement.find({ status: 'approved' })
      .sort({ createdAt: -1 }) 
      .limit(3); 
    res.json(approvedAnnouncements);
  } catch (error) {
    console.error('Error fetching approved announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRecentAnnouncements = async (req, res) => {
  try {
    const approvedAnnouncements = await Announcement.find({ status: 'approved' })
      .sort({ createdAt: -1 }) 
      .limit(10);
      
    res.json(approvedAnnouncements);
  } catch (error) {
    console.error('Error fetching approved announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserAnnouncements = async (req, res) => {
  try {
    // Fetch the logged-in user's announcements
    const userAnnouncements = await Announcement.find({ postedBy: req.user.name });
    
    // Respond with the announcements
    res.json(userAnnouncements);
  } catch (error) {
    console.error('Error fetching user announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { postId } = req.params;
    const { header, body } = req.body;

    const announcement = await Announcement.findById(postId);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if the user is authorized to edit this announcement
    if (announcement.postedBy !== req.user.name) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    announcement.header = header;
    announcement.body = body;
    announcement.updatedAt = Date.now();

    await announcement.save();

    res.status(200).json({ message: 'Announcement updated successfully', announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
 const deleteAnnouncement = async(req,res) =>{
  try{
    const {postId} = req.params;

    const announcement = await Announcement.findByIdAndDelete(postId);

    if(!announcement){
      return res.status(404).json({message: 'Announcement not found'});
    }

    if(announcement.postedBy!== req.user.name){
      return res.status(403).json({message: 'Unauthorized'});
    }

    res.status(200).json({message:'Announcement deleted successfully', announcement});
  }catch(error){
    console.error('Error deleting announcement', error);
    res.status(500).json({message:'Internal Server Error'})
  }
 }

 const mongoose = require('mongoose'); // Ensure mongoose is required

const getCommentsByAnnouncementId = async (req, res) => {
  try {
    const { announcementId } = req.params;  // Get announcementId from params
    const postId = announcementId;  // Both announcementId and postId are the same, so we reuse it

    // Use the 'new' keyword to create an instance of ObjectId
    const objectId = new mongoose.Types.ObjectId(postId);  // Correct way to create ObjectId

    // Query using $or to check for both postId and announcementId
    const comments = await PostComments.find({
      $or: [
        { postId: objectId }, 
        { announcementId: objectId } // Check either postId or announcementId
      ]
    }).populate('userId', 'name');
    
    console.log("Post ID:", postId);  // For debugging
    console.log("Comments:", comments);  // For debugging

    res.status(200).json(comments);  // Send the result as JSON
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error while fetching comments' });
  }
};



const deleteComments = async (req, res) => {
  try {
    const { commentId } = req.params; 
    const userId = req.user.id; 

    const comment = await PostComments.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await PostComments.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error while deleting comment' });
  }
};




module.exports = {
  createAnnouncement,
  authenticate, 
  getPendingAnnouncements,
  updateAnnouncementStatus,
  getApprovedAnnouncements,
  getUserAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getRecentAnnouncements,
  getCommentsByAnnouncementId,
  deleteComments 
};
