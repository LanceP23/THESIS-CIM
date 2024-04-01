const Event = require('../models/event');
const User = require('../models/user');
const postEventController = async (req, res) => {
  try {
    const { title, start, end, eventType } = req.body;

    if (!title || !start || !end || !eventType ) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const createdBy = req.user.id;

    const newEvent = new Event({
      title,
      start,
      end,
      eventType,
      createdBy
    });

    const savedEvent = await newEvent.save();

    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getEventsController = async (req, res) => {
    try {
      // Fetch events from the database
      const events = await Event.find();
      // Return the events to the client
      return res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  

module.exports = {
    postEventController,
    getEventsController
}
