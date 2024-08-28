import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'; // Import Views for Agenda view
import moment from 'moment';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReactModal from 'react-modal';

const localizer = momentLocalizer(moment);

const ManageEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/fetch-event');
        const transformedEvents = response.data.map(event => ({
          id: event._id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          allDay: false,
          ...event,
        }));
        setEvents(transformedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Error fetching events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (confirmDelete) {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
        const response = await axios.delete(`/delete-event/${selectedEvent.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEvent.id));
          closeModal();
          toast.success('Event deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Error deleting event');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-events-container">
      <h2>Your Events</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={{ agenda: true }} // Enable Agenda view
        defaultView={Views.AGENDA} // Set default view to Agenda
        onSelectEvent={handleSelectEvent}
      />

      {selectedEvent && (
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Event Details"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h3>{selectedEvent.title}</h3>
          <p><strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
          <p><strong>Event Type:</strong> {selectedEvent.eventType}</p>
          <p><strong>Organizer:</strong> {selectedEvent.organizerName}</p>
          <p><strong>Location:</strong> {selectedEvent.location}</p>
          <p><strong>Budget:</strong> {selectedEvent.budget}</p>
          <p><strong>Participants:</strong> {selectedEvent.participants?.join(', ')}</p>
          <p><strong>Committee:</strong> {selectedEvent.committee}</p>
          <p><strong>Committee Chairman:</strong> {selectedEvent.committeeChairman}</p>

          <div className="actions">
            <button onClick={() => handleEdit(selectedEvent)} className="edit-btn">
              Edit Event
            </button>
            <button onClick={handleDelete} className="delete-btn">
              Delete Event
            </button>
          </div>
          <button onClick={closeModal} className="close-btn">Close</button>
        </ReactModal>
      )}
    </div>
  );
};

export default ManageEvent;
