import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications'; // Adjust the path as necessary

const NotificationBell = () => {
    const notifications = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        setUnreadCount(notifications.length);
    }, [notifications]);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
        // When the dropdown is opened, mark all notifications as read
        if (!showDropdown) {
            setUnreadCount(0);
        }
    };

    return (
        <div className="notification-bell">
           
     
                <div className="notification-dropdown">
                    <h3>Notifications</h3>
                    {notifications.length > 0 ? (
                        <ul>
                            {notifications.map((notification, index) => (
                                <li key={index}>
                                    New message from {notification.senderName}: {notification.message}
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
