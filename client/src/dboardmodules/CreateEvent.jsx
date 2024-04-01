import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import Modal from 'react-modal';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, 
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    maxWidth: '500px',
    padding: '20px',
    textAlign: 'center',
    zIndex: 1001, 
  },
};

const CreateEvent = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState('');
  const [events, setEvents] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const[adminType, setAdminType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
          navigate('/login');
        } else {
          setAuthenticated(true);
          setAdminType(localStorage.getItem('adminType'));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };
    checkAuthStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/fetch-event');
        const formattedEvents = response.data.map(event => ({
          title: `${moment(event.start).format('h:mma')} - ${event.title}`,
          start: event.start,
          end: event.end,
          ...event, 
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event); 
    setModalIsOpen(true); 
  };

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setEventName('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setEventType('');
  };

  const handleEventCreate = async () => {
    try {
      const token = getToken();
      const response = await axios.post(
        '/events',
        {
          title: eventName,
          start: `${startDate}T${startTime}`,
          end: `${endDate}T${endTime}`,
          eventType: eventType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Event created:', response.data);
      toast.success('Event Creation Successful!')
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Event Creation Failed',error);
    }
  };

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Add Event</button>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick} 
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        style={customStyles}
        contentLabel="Event Details Modal"
      >
        <h2>{selectedEvent ? 'Event Details' : 'Create Event'}</h2>
        {selectedEvent ? (
          <div>
            <p>Title: {selectedEvent.title}</p>
            <p>Start Time: {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm a')}</p>
            <p>End Time: {moment(selectedEvent.end).format('MMMM Do YYYY, h:mm a')}</p>
          </div>
        ) : (
          <div>
            <div>
              <label>
                Event Name:
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                Start Date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                Start Time:
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <label>
                End Time:
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                Event Type:
                <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  <option value="">Select Event Type</option>
                  <option value="institutional">Institutional</option>
                  <option value="organizational">Organizational</option>
                  <option value="structural">Structural</option>
                  <option value="specialized">Specialized</option>
                </select>
              </label>
            </div>
            <button onClick={handleEventCreate}>Create</button>
          </div>
        )}
        <button onClick={handleCloseModal}>Close</button>
      </Modal>
    </div>
  );
};

export default CreateEvent;
