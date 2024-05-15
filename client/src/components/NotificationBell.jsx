import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useAnnouncementNotifications from '../hooks/useAnnouncementNotifications';
import useEventNotifications from '../hooks/useEventNotifications';
import useApprovalNotifications from '../hooks/useApprovalNotifications';

const NotificationBell = () => {
    const messageNotifications = useNotifications();
    const announcementNotifications = useAnnouncementNotifications();
    const eventNotifications = useEventNotifications();
    const approvalNotifications = useApprovalNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
    const [unreadEventCount, setUnreadEventCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null); 
    const [latestEvent, setLatestEvent] = useState(null);
    const [unreadApprovalCount, setUnreadApprovalCount] = useState(0);
    const [latestApproval, setLatestApproval] = useState(null);

    useEffect(() => {
        setUnreadMessageCount(messageNotifications.length);
    }, [messageNotifications]);

    useEffect(() => {
        setUnreadAnnouncementCount(announcementNotifications.length);
    }, [announcementNotifications]);

    useEffect(() => {
        setUnreadEventCount(eventNotifications.length);
    }, [eventNotifications]);

    useEffect(() => {
        setUnreadApprovalCount(approvalNotifications.length); 
    }, [approvalNotifications]);

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
    
    useEffect(() => {
        if (eventNotifications.length > 0) {
            setLatestEvent({
                eventName: eventNotifications[0].eventName,
                organizerName: eventNotifications[0].organizerName
            });
            setTimeout(() => {
                setLatestEvent(null);
            }, 5000);
        }
    }, [eventNotifications]);

    useEffect(() => {
        if (approvalNotifications.length > 0) {
            setLatestApproval({
                message: approvalNotifications[0].message,
                posterName: approvalNotifications[0].posterName,
                timestamp: approvalNotifications[0].timestamp
            });
            setTimeout(() => {
                setLatestApproval(null);
            }, 5000);
        }
    }, [approvalNotifications]);

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
                        {eventNotifications.map((event, index) => (
                            <li key={index}>
                                New event: {event.eventName} organized by {event.organizerName}
                            </li>
                        ))}
                        {approvalNotifications.map((approval, index) => (
                            <li key={index}>
                                Announcement approved: {approval.message} by {approval.posterName} at {approval.timestamp}
                            </li>
                        ))}
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
             {latestEvent && (
                <div className="notification-popup">
                    <p>New event: {latestEvent.eventName} organized by {latestEvent.organizerName}</p>
                </div>
            )}
            {latestApproval && (
                <div className="notification-popup">
                    <p>Announcement approved: {latestApproval.message} by {latestApproval.posterName} at {latestApproval.timestamp}</p>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
