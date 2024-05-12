import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useAnnouncementNotifications from '../hooks/useAnnouncementNotifications';
import useEventNotifications from '../hooks/useEventNotifications';

const NotificationBell = () => {
    const messageNotifications = useNotifications();
    const announcementNotifications = useAnnouncementNotifications();
    const eventNotifications = useEventNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
    const [unreadEventCount, setUnreadEventCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null); 
    const [latestEvent, setLatestEvent] = useState(null); // Add state for latest event

    useEffect(() => {
        setUnreadMessageCount(messageNotifications.length);
    }, [messageNotifications]);

    useEffect(() => {
        setUnreadAnnouncementCount(announcementNotifications.length);
    }, [announcementNotifications]);

    useEffect(() => {
        setUnreadEventCount(eventNotifications.length);
        if (eventNotifications.length > 0) {
            // Set the latest event when eventNotifications change
            setLatestEvent(eventNotifications[0]);
        }
    }, [eventNotifications]);

    // Set the latest message whenever there is a new message notification
    useEffect(() => {
        if (messageNotifications.length > 0) {
            setLatestMessage(`New message from ${messageNotifications[0].senderName}: ${messageNotifications[0].message}`);
            setTimeout(() => {
                setLatestMessage(null);
            }, 5000);
        }
    }, [messageNotifications]);

    useEffect(() => {
        if (announcementNotifications.length > 0) {
            setLatestMessage(`New announcement: ${announcementNotifications[0].announcementHeader} by ${announcementNotifications[0].posterName}`);
            setTimeout(() => {
                setLatestMessage(null); 
            }, 5000);
        }
    }, [announcementNotifications]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
        // When the dropdown is opened, mark all notifications as read
        if (!showDropdown) {
            setUnreadMessageCount(0);
            setUnreadAnnouncementCount(0);
            setUnreadEventCount(0);
        }
    };

    return (
        <div className="notification-bell">
            <div className="notification-dropdown">
                <h3>Notifications</h3>
                {(unreadMessageCount + unreadAnnouncementCount + unreadEventCount) > 0 && (
                    <span className="notification-count">{unreadMessageCount + unreadAnnouncementCount + unreadEventCount}</span>
                )}
                {(messageNotifications.length + announcementNotifications.length + eventNotifications.length) > 0 ? (
                    <ul>
                        {messageNotifications.map((notification, index) => (
                            <li key={index}>
                                New message from {notification.senderName}: {notification.message}
                            </li>
                        ))}
                        {announcementNotifications.map((announcement, index) => (
                            <li key={index}>
                                New announcement: {announcement.announcementHeader} by {announcement.posterName}
                            </li>
                        ))}
                        {latestEvent && ( // Render the latest event if it exists
                            <li>
                                New event: {latestEvent.eventName} by {latestEvent.organizerName}
                            </li>
                        )}
                    </ul>
                ) : (
                    <p>No new notifications</p>
                )}
            </div>
            {latestMessage && (
                <div className="notification-popup">
                    <p>{latestMessage}</p>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
