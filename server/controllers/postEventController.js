const Event = require('../models/event');
const Organization = require('../models/organization');
const Community = require('../models/community');
const User = require('../models/user');
const MobileUser = require('../models/mobileUser');
const { getReceiverSocketId, io } = require('../socketManager');


const postEventController = async (req, res) => {
  try {
    // Destructure request body
    const { title, start, end, eventType, organizerType, organizerName, participants, committee, committeeChairman, location, budget, viewCommunityId } = req.body;

    // Validate required fields
    if (!title || !start || !end || !eventType || !organizerType || !organizerName || !participants || !committee || !committeeChairman || !location || !budget) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate participants format
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants must be provided as an array' });
    }

    // Convert participants array to string
    const participantsString = JSON.stringify(participants);

    // Check if the organizer is an existing organization
    let organizerId;
    if (organizerType === 'Organization') {
      const organizerExists = await Organization.findOne({ name: organizerName });
      if (!organizerExists) {
        return res.status(404).json({ error: 'Organizer not found' });
      }
      organizerId = organizerExists._id;
    }

    // Create the new event
    const createdBy = req.user.id;
    const newEvent = new Event({
      title,
      start,
      end,
      eventType,
      organizerType,
      organizerName,
      participants: participantsString, // Assign the stringified participants
      committee,
      committeeChairman,
      location,
      budget,
      viewCommunityId, 
      createdBy
    });

    // Save the new event to the database
    const savedEvent = await newEvent.save();

    if (eventType.toLowerCase() === 'institutional') {
      const eventNotificationData = {
        type: "event",
        message: "New event created",
        eventName: title,
        organizerName: organizerName,
        timestamp: new Date().toISOString()
      };


      // Sending notifications to both regular users and mobile users
      const allUsers = await User.find();
      const allMobileUsers = await MobileUser.find();

      allUsers.forEach(user => {
        const receiverSocketId = getReceiverSocketId(user.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEvent", eventNotificationData);
        }
      });

      allMobileUsers.forEach(mobileUser => {
        const receiverSocketId = getReceiverSocketId(mobileUser.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEventMobile", eventNotificationData);
        }
      });
    }
    if (eventType.toLowerCase() === 'organizational') {
      const organizationNames = participants
        .filter(participant => participant.type === 'organizational')
        .map(participant => participant.name);

      // Get all users who are members of the organizational participants from both User and MobileUser tables maybe itll work maybe it won't
      const usersToNotify = await User.find({ organization: { $in: organizationNames } });

      // Send notifications to each user from User table
      usersToNotify.forEach(user => {
        const receiverSocketId = getReceiverSocketId(user.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEvent", {
            type: "event",
            message: "New event created",
            eventName: title,
            organizerName: organizerName,
            timestamp: new Date().toISOString()
          });
        }
      });

    } else if (eventType.toLowerCase() === 'organizational') {
      // Get organization names from participants
      const organizationNames = participants
        .filter(participant => participant.type === 'organizational')
        .map(participant => participant.name);

      // Get users who are members of the organizational participants
      const usersToNotify = await User.find({ organization: { $in: organizationNames } });

      // Get mobile users who are members of the organizational participants
      const mobileUsersToNotify = await MobileUser.find({ organization: { $in: organizationNames } });

      // Send notifications to users
      usersToNotify.forEach(user => {
        const receiverSocketId = getReceiverSocketId(user.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEvent", {
            type: "event",
            message: "New event created",
            eventName: title,
            organizerName: organizerName,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Send notifications to mobile users
      mobileUsersToNotify.forEach(mobileUser => {
        const receiverSocketId = getReceiverSocketId(mobileUser.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEventMobile", {
            type: "event",
            message: "New event created",
            eventName: title,
            organizerName: organizerName,
            timestamp: new Date().toISOString()
          });
        }
      });
    } else if (eventType.toLowerCase() === 'specialized') {
      const communityIds = participants
        .filter(participant => participant.type === 'community')
        .map(participant => participant.id);

      // Retrieve all Community documents by the IDs specified
      const communities = await Community.find({ _id: { $in: communityIds } });

      // Collect all member IDs from these communities
      const memberIds = communities.flatMap(community => community.members);
      const mobileMemberIds = communities.flatMap(community => community.mobileMembers);

      // Find all users who are members of these communities
      const usersToNotify = await User.find({ _id: { $in: memberIds } });
      const mobileUsersToNotify = await MobileUser.find({ _id: { $in: mobileMemberIds } });

      const notificationData = {
        type: "event",
        message: "New specialized event created",
        eventName: title,
        organizerName: organizerName,
        timestamp: new Date().toISOString()
      };

      // Send notifications to users
      usersToNotify.forEach(user => {
        const receiverSocketId = getReceiverSocketId(user.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEvent", notificationData);
        }
      });

      // Send notifications to mobile users
      mobileUsersToNotify.forEach(mobileUser => {
        const receiverSocketId = getReceiverSocketId(mobileUser.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newEventMobile", notificationData);
        }
      });
    }

    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getEventsController = async (req, res) => {
  try {
    // Fetch events from the database
    const currentDate = new Date(); // Get the current date and time
    const events = await Event.find({ end: { $gte: currentDate } }); // Filter out events that have not ended yet
    // Return the events to the client
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const putEventController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start, end, eventType, organizerType, organizerName, participants, committee, committeeChairman, location, budget, viewCommunityId } = req.body;

    // Validate required fields
    if (!title || !start || !end || !eventType || !organizerType || !organizerName || !participants || !committee || !committeeChairman || !location || !budget) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate participants format
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants must be provided as an array' });
    }

    // Convert participants array to string
    const participantsString = JSON.stringify(participants);

    // Check if the organizer is an existing organization
    let organizerId;
    if (organizerType === 'Organization') {
      const organizerExists = await Organization.findOne({ name: organizerName });
      if (!organizerExists) {
        return res.status(404).json({ error: 'Organizer not found' });
      }
      organizerId = organizerExists._id;
    }

    // Update the existing event
    const updatedEvent = await Event.findByIdAndUpdate(id, {
      title,
      start,
      end,
      eventType,
      organizerType,
      organizerName,
      participants: participantsString,
      committee,
      committeeChairman,
      location,
      budget,
    }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteEventController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(deletedEvent);
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  postEventController,
  getEventsController,
  putEventController,
  deleteEventController
};
