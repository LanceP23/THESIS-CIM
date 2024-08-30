import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'; 
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
  const [editMode, setEditMode] = useState(false);  
  const [eventForm, setEventForm] = useState({});

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
    setEventForm({
      title: event.title,
      start: event.start,
      end: event.end,
      eventType: event.eventType,
      organizerType: event.organizerType, // Update this field name
      organizerName: event.organizerName,
      participants: JSON.parse(event.participants),
      committee: event.committee,
      committeeChairman: event.committeeChairman,
      location: event.location,
      budget: event.budget,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setEditMode(false);  
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

  const handleEdit = () => {
    setEditMode(true);  
  };

  const handleSave = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      const response = await axios.put(`/update-event/${selectedEvent.id}`, {
        ...eventForm,
        participants: eventForm.participants,
        organizerType: eventForm.organizerType, // Ensure this field is correctly used
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const updatedEvent = response.data;
        setEvents((prevEvents) =>
          prevEvents.map((event) => (event.id === updatedEvent._id ? updatedEvent : event))
        );
        toast.success('Event updated successfully');
        closeModal();
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Error updating event');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...eventForm.participants];
    updatedParticipants[index][field] = value;
    setEventForm((prevForm) => ({ ...prevForm, participants: updatedParticipants }));
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
        views={{ agenda: true }} 
        defaultView={Views.AGENDA} 
        onSelectEvent={handleSelectEvent}
      />

      {selectedEvent && (
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Event Details"
          className="event-details-modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2>{editMode ? 'Edit Event' : 'Event Details'}</h2>
          </div>
          <div className="modal-content">
            <div className="event-info">
              <div className="event-details-box">
                {editMode ? (
                  <>
                    <label>Event Name: <input name="title" value={eventForm.title} onChange={handleInputChange} /></label>
                    <label>Start Date: <input type="datetime-local" name="start" value={eventForm.start} onChange={handleInputChange} /></label>
                    <label>End Date: <input type="datetime-local" name="end" value={eventForm.end} onChange={handleInputChange} /></label>
                    <label>Event Type: 
                      <select name="eventType" value={eventForm.eventType} onChange={handleInputChange}>
                        <option value="institutional">Institutional</option>
                        <option value="organization">Organization</option>
                        <option value="specialized">Specialized</option>
                      </select>
                    </label>
                    <label>Organizer Type: 
                      <select name="organizerType" value={eventForm.organizerType} onChange={handleInputChange}> {/* Update here */}
                        <option value="person">Person</option>
                        <option value="organization">Organization</option>
                        <option value="school">School</option>
                      </select>
                    </label>
                    <label>Organizer Name: 
                      <input name="organizerName" value={eventForm.organizerName} onChange={handleInputChange} />
                    </label>
                  </>
                ) : (
                  <>
                    <h3>Event Name: <span>{selectedEvent.title}</span></h3>
                    <p><strong>Start Date:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
                    <p><strong>End Date:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
                    <p><strong>Event Type:</strong> {selectedEvent.eventType}</p>
                    <p><strong>Organizer Type:</strong> {selectedEvent.organizerType}</p> {/* Update here */}
                    <p><strong>Organizer name: </strong>{selectedEvent.organizerName}</p>
                    <p><strong>Commitee: </strong>{selectedEvent.committee}</p>
                    <p><strong>Commitee Chairman: </strong>{selectedEvent.committeeChairman}</p>
                    <p><strong>Location: </strong>{selectedEvent.location}</p>
                    <p><strong>Budget: </strong>{selectedEvent.budget}</p>
                  </>
                )}
              </div>
            </div>
            <div className="participants-section">
              <h3>Participants:</h3>
              {editMode ? (
                eventForm.participants.map((participant, index) => (
                  <div key={index} className="participant-card">
                    <label>Name: <input value={participant.name} onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} /></label>
                    <label>Section: <input value={participant.section} onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} /></label>
                    <label>Type: <input value={participant.type} onChange={(e) => handleParticipantChange(index, 'type', e.target.value)} /></label>
                  </div>
                ))
              ) : (
                selectedEvent.participants && selectedEvent.participants.length > 0 ? (
                  JSON.parse(selectedEvent.participants).map((participant, index) => (
                    <div key={index} className="participant-card">
                      <p><strong>Name:</strong> {participant.name}</p>
                      <p><strong>Section:</strong> {participant.section}</p>
                      <p><strong>Type:</strong> {participant.type}</p>
                    </div>
                  ))
                ) : (
                  <p>No participants available.</p>
                )
              )}
            </div>
          </div>
          <div className="modal-footer">
            {editMode ? (
              <>
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button onClick={closeModal} className="close-btn">Cancel</button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={handleEdit}>Edit</button>
                <button className="delete-btn" onClick={handleDelete}>Delete</button>
                <button onClick={closeModal} className="close-btn">Close</button>
              </>
            )}
          </div>
        </ReactModal>
      )}
    </div>
  );
};

export default ManageEvent;
