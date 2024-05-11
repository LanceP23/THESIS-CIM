import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useAnnouncementNotifications from '../hooks/useAnnouncementNotifications'; 

const NotificationBell = () => {
    const messageNotifications = useNotifications();
    const announcementNotifications = useAnnouncementNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);

    useEffect(() => {
        setUnreadMessageCount(messageNotifications.length);
    }, [messageNotifications]);

    useEffect(() => {
        setUnreadAnnouncementCount(announcementNotifications.length);
    }, [announcementNotifications]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
        // When the dropdown is opened, mark all notifications as read
        if (!showDropdown) {
            setUnreadMessageCount(0);
            setUnreadAnnouncementCount(0);
        }
    };

    return (
        <div className="notification-bell">
           
     
                <div className="notification-dropdown">
                    <h3>Notifications</h3>
                    {(unreadMessageCount + unreadAnnouncementCount) > 0 && (
                    <span className="notification-count">{unreadMessageCount + unreadAnnouncementCount}</span>
                )}
                    {(messageNotifications.length + announcementNotifications.length) > 0 ? (
                        <ul>
                            {messageNotifications.map((notification, index) => (
                                <li key={index}>
                                    New message from {notification.senderName}: {notification.message}
                                </li>
                            ))}
                            {announcementNotifications.map((announcement, index) => (
                                <li key={index}>
                                    New announcement: {announcement.announcementHeader} by {announcement.senderName}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No new notifications</p>
                    )}
                </div>
           
        </div>
    );
};

export default NotificationBell;
