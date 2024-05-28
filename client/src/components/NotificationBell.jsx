import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useAnnouncementNotifications from '../hooks/useAnnouncementNotifications';
import useEventNotifications from '../hooks/useEventNotifications';
import useApprovalNotifications from '../hooks/useApprovalNotifications';
import useOrganizationAnnouncementNotifications from '../hooks/useOrganizationAnnouncementNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const NotificationBell = ({ setTotalUnreadCount }) => {
    const messageNotifications = useNotifications();
    const announcementNotifications = useAnnouncementNotifications();
    const eventNotifications = useEventNotifications();
    const approvalNotifications = useApprovalNotifications();
    const organizationAnnouncementNotifications = useOrganizationAnnouncementNotifications();
    
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
    const [unreadEventCount, setUnreadEventCount] = useState(0);
    const [unreadApprovalCount, setUnreadApprovalCount] = useState(0);
    const [unreadOrganizationAnnouncementCount, setUnreadOrganizationAnnouncementCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null); 
    const [latestEvent, setLatestEvent] = useState(null);
    const [latestApproval, setLatestApproval] = useState(null);
    const [latestOrganizationAnnouncement, setLatestOrganizationAnnouncement] = useState(null);

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

    useEffect(() => {
        setUnreadOrganizationAnnouncementCount(organizationAnnouncementNotifications.length);
    }, [organizationAnnouncementNotifications]);

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

    useEffect(() => {
        if (organizationAnnouncementNotifications.length > 0) {
            setLatestOrganizationAnnouncement({
                announcementHeader: organizationAnnouncementNotifications[0].announcementHeader,
                posterName: organizationAnnouncementNotifications[0].posterName
            });
            setTimeout(() => {
                setLatestOrganizationAnnouncement(null);
            }, 5000);
        }
    }, [organizationAnnouncementNotifications]);

    const toggleDropdown = () => {
        setShowDropdown(prev => {
            if (!prev) {
                setUnreadMessageCount(0);
                setUnreadAnnouncementCount(0);
                setUnreadEventCount(0);
                setUnreadApprovalCount(0);
                setUnreadOrganizationAnnouncementCount(0);
            }
            return !prev;
        });
    };

    useEffect(() => {
        const totalUnreadCount = unreadMessageCount + unreadAnnouncementCount + unreadEventCount + unreadApprovalCount + unreadOrganizationAnnouncementCount;
        setTotalUnreadCount(totalUnreadCount);
    }, [unreadMessageCount, unreadAnnouncementCount, unreadEventCount, unreadApprovalCount, unreadOrganizationAnnouncementCount, setTotalUnreadCount]);

    return (
        <div className="notification-bell">
            <h3 className='border-b-2 text-left'>Notifications</h3>
            <div className="notification-dropdown max-h-40 overflow-auto w-full">
                {(unreadMessageCount + unreadAnnouncementCount + unreadEventCount + unreadApprovalCount + unreadOrganizationAnnouncementCount) > 0 && (
                    <span className="notification-count"></span>
                )}
                {(messageNotifications.length + announcementNotifications.length + eventNotifications.length + organizationAnnouncementNotifications.length) > 0 ? (
                    <ul>
                        {messageNotifications.map((notification, index) => (
                            <div className="flex justify-between my-3 border-b-2 pb-2" key={index}>
                                <div className="avatar">
                                    <div className="w-10 mask mask-squircle">
                                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="avatar" />
                                    </div>
                                </div>
                                <div className="div">
                                    <li>
                                        New message from {notification.senderName}: {notification.message}
                                    </li>
                                </div>
                            </div>
                        ))}
                        {announcementNotifications.map((announcement, index) => (
                            <div className="flex justify-between my-3" key={index}>
                                <div className="avatar">
                                    <div className="w-10 mask mask-squircle">
                                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="avatar" />
                                    </div>
                                </div>
                                <div className="div">
                                    <li>
                                        New announcement: {announcement.announcementHeader} by {announcement.posterName}
                                    </li>
                                </div>
                            </div>
                        ))}
                        {eventNotifications.map((event, index) => (
                            <div className="flex justify-between my-3" key={index}>
                                <div className="avatar">
                                    <div className="w-10 mask mask-squircle">
                                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="avatar" />
                                    </div>
                                </div>
                                <div className="div">
                                    <li>
                                        New event: {event.eventName} organized by {event.organizerName}
                                    </li>
                                </div>
                            </div>
                        ))}
                        {approvalNotifications.map((approval, index) => (
                            <div className="flex justify-between my-3" key={index}>
                                <div className="avatar">
                                    <div className="w-10 mask mask-squircle">
                                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="avatar" />
                                    </div>
                                </div>
                                <div className="div">
                                    <li>
                                        Announcement approved: {approval.message} by {approval.posterName} at {approval.timestamp}
                                    </li>
                                </div>
                            </div>
                        ))}
                        {organizationAnnouncementNotifications.map((announcement, index) => (
                            <div className="flex justify-between my-3" key={index}>
                                <div className="avatar">
                                    <div className="w-10 mask mask-squircle">
                                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="avatar" />
                                    </div>
                                </div>
                                <div className="div">
                                    <li>
                                        New organization announcement: {announcement.announcementHeader} by {announcement.posterName}
                                    </li>
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p className=' my-2'>No new notifications</p>
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
            {latestOrganizationAnnouncement && (
                <div className="notification-popup">
                    <p>New organization announcement: {latestOrganizationAnnouncement.announcementHeader} by {latestOrganizationAnnouncement.posterName}</p>
                </div>

            )}

            <div className="flex flex-row justify-starts mt-1">
                <Link to="/notif-module" className='btn-link p-0'>
          <p className=''><FontAwesomeIcon  icon={faList} />   See all</p>
          </Link>
            </div>
        </div>
    );
};

export default NotificationBell;
