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
    const { header, body, mediaUrl, visibility, postingDate, expirationDate, communityId, organizationId } = req.body;
    let contentType = null;
    let status = 'pending';

    if (req.user.adminType === 'School Owner') {
      if (postingDate && new Date(postingDate) > new Date()) {
        status = 'scheduled';
      } else {
        status = 'approved';
      }
    }

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
    };

    if (communityId) {
      announcementData.communityId = communityId;
    }

    if (organizationId) {
      announcementData.organizationId = organizationId;
    }

    const announcement = new Announcement(announcementData);
    await announcement.save();

    let targetUsers = [];
    let recipientIds = new Set(); // Use a Set to avoid duplicates

    const parsedVisibility = JSON.parse(visibility);
    const allMobileUsers = await MobileUser.find();
    if (parsedVisibility.everyone) {
      const allUsers = await User.find();
      
      targetUsers.push(...allUsers, ...allMobileUsers);
    } else {
      if (parsedVisibility.staff) {
        const staffUsers = await User.find({ position: { $exists: false }, organization: { $exists: false }, department: { $exists: false } });
        targetUsers.push(...staffUsers);
      }
      if (parsedVisibility.faculty) {
        const facultyUsers = await User.find({ department: { $exists: true } });
        targetUsers.push(...facultyUsers);
      }
      if (parsedVisibility.students) {
        const studentUsers = await User.find({ position: { $exists: true }, organization: { $exists: true } });
        targetUsers.push(...studentUsers, ...allMobileUsers);
      }
    }

    targetUsers.forEach(user => recipientIds.add(user._id.toString()));

    const notificationDataTemplate = {
      type: 'announcement',
      message: 'New announcement posted',
      posterName: req.user.name,
      announcementHeader: header,
      announcementBody: body,
      timestamp: new Date().toISOString(),
      recipientIds: Array.from(recipientIds), // Convert Set to Array
    };

    const notification = new Notification(notificationDataTemplate);
    await notification.save();

    targetUsers.forEach(user => {
      const receiverSocketId = getReceiverSocketId(user._id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newAnnouncement", notificationDataTemplate);
      }
    });

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

      // Remove any duplicates between general and community-specific recipients
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
        console.log(id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newCommunityAnnouncement", communityNotificationData);
        }
      });
    }

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
    const { status } = req.body;
    console.log('Received Announcement ID:', announcementId);
    console.log('Received Status:', status);

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

    announcement.status = status;
    await announcement.save();

    if (status === 'approved') {
      // Find the user by their email (postedBy)
      const postingUser = await User.findOne({ studentemail: announcement.postedBy });
      if (postingUser) {
        // Emit a socket event to the user who created the announcement
        const receiverSocketId = getReceiverSocketId(postingUser._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('announcementApproved', {
            type: 'announcement',
            message: `Your announcement titled "${announcement.header}" has been approved.`,
            announcementId: announcementId
          });

          // Store the notification in the database
          const newNotification = new Notification({
            type: 'other',
            message: `Your announcement titled "${announcement.header}" has been approved.`,
            recipientIds: [postingUser._id], // Note the array
            posterName: announcement.postedBy,
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
              posterName: announcement.postedBy,
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
          posterName: announcement.postedBy,
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
                  posterName: announcement.postedBy,
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
              posterName: announcement.postedBy,
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
                  posterName: announcement.postedBy,
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
              posterName: announcement.postedBy,
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

 const getCommentsByAnnouncementId = async (req, res) => {
  try {
    const { announcementId } = req.params;    
    const comments = await PostComments.find({ announcementId }).populate('userId', 'name'); 

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error while fetching comments' });
  }
};

const deleteComments = async (req, res) => {
  try {
    const { commentId } = req.params; 
    const userId = req.user.id; 

    // Find the comment to check ownership
    const comment = await PostComments.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // If the user is authorized, delete the comment
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
