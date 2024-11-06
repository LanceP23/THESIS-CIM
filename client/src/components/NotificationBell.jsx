import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useAnnouncementNotifications from '../hooks/useAnnouncementNotifications';
import useEventNotifications from '../hooks/useEventNotifications';
import useApprovalNotifications from '../hooks/useApprovalNotifications';
import useOrganizationAnnouncementNotifications from '../hooks/useOrganizationAnnouncementNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import useCommunityNotification from '../hooks/useCommunityNotification';
import axios from 'axios';

const NotificationBell = ({ setTotalUnreadCount }) => {
    const announcementNotifications = useAnnouncementNotifications();
    const eventNotifications = useEventNotifications();
    const approvalNotifications = useApprovalNotifications();
    const organizationAnnouncementNotifications = useOrganizationAnnouncementNotifications();
    const communityNotifications = useCommunityNotification(); 
    
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
    const [unreadEventCount, setUnreadEventCount] = useState(0);
    const [unreadApprovalCount, setUnreadApprovalCount] = useState(0);
    const [unreadOrganizationAnnouncementCount, setUnreadOrganizationAnnouncementCount] = useState(0);
    const [unreadCommunityNotificationCount, setUnreadCommunityNotificationCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null); 
    const [latestEvent, setLatestEvent] = useState(null);
    const [latestApproval, setLatestApproval] = useState(null);
    const [latestOrganizationAnnouncement, setLatestOrganizationAnnouncement] = useState(null);
    const [latestCommunityNotification, setLatestCommunityNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const getToken = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token) {
          throw new Error('Token not found');
        }
        return token.split('=')[1];
      };

      useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = getToken();
                const response = await axios.get('/notifications', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const lastFiveNotifications = response.data.slice(-5);
                setNotifications(lastFiveNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        // Load notification data from local storage
        const savedNotifications = JSON.parse(localStorage.getItem('notifications'));
        if (savedNotifications) {
            // Update state with saved notification data
            setUnreadMessageCount(savedNotifications.unreadMessageCount || 0);
            setUnreadAnnouncementCount(savedNotifications.unreadAnnouncementCount || 0);
            setUnreadEventCount(savedNotifications.unreadEventCount || 0);
            setUnreadApprovalCount(savedNotifications.unreadApprovalCount || 0);
            setUnreadOrganizationAnnouncementCount(savedNotifications.unreadOrganizationAnnouncementCount || 0);
            setUnreadCommunityNotificationCount(savedNotifications.unreadCommunityNotificationCount || 0);
            setLatestMessage(savedNotifications.latestMessage || null);
            setLatestEvent(savedNotifications.latestEvent || null);
            setLatestApproval(savedNotifications.latestApproval || null);
            setLatestOrganizationAnnouncement(savedNotifications.latestOrganizationAnnouncement || null);
            setLatestCommunityNotification(savedNotifications.latestCommunityNotification || null);
        }
    }, []);

    useEffect(() => {
        // Save notification data to local storage whenever it changes
        const notifications = {
            unreadMessageCount,
            unreadAnnouncementCount,
            unreadEventCount,
            unreadApprovalCount,
            unreadOrganizationAnnouncementCount,
            unreadCommunityNotificationCount,
            latestMessage,
            latestEvent,
            latestApproval,
            latestOrganizationAnnouncement,
            latestCommunityNotification
        };
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [
        unreadMessageCount,
        unreadAnnouncementCount,
        unreadEventCount,
        unreadApprovalCount,
        unreadOrganizationAnnouncementCount,
        unreadCommunityNotificationCount,
        latestMessage,
        latestEvent,
        latestApproval,
        latestOrganizationAnnouncement,
        latestCommunityNotification
    ]);

   

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
        setUnreadCommunityNotificationCount(communityNotifications.length); 
    }, [communityNotifications]);

    

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

    useEffect(() => {
        if (communityNotifications.length > 0) {
            setLatestCommunityNotification({
                announcementHeader: communityNotifications[0].announcementHeader,
                posterName: communityNotifications[0].posterName
            });
            setTimeout(() => {
                setLatestCommunityNotification(null);
            }, 5000);
        }
    }, [communityNotifications]);

    useEffect(() => {
        // Calculate total unread count
        const totalUnreadCount =  unreadAnnouncementCount + unreadEventCount + unreadApprovalCount + unreadOrganizationAnnouncementCount + unreadCommunityNotificationCount;
        setTotalUnreadCount(totalUnreadCount);
    }, [ unreadAnnouncementCount, unreadEventCount, unreadApprovalCount, unreadOrganizationAnnouncementCount , unreadCommunityNotificationCount, setTotalUnreadCount]);

        const toggleDropdown = () => {
            setShowDropdown(prev => {
                if (!prev) {
                    // Reset notification counts when opening the dropdown
                    setUnreadMessageCount(0);
                    setUnreadAnnouncementCount(0);
                    setUnreadEventCount(0);
                    setUnreadApprovalCount(0);
                    setUnreadOrganizationAnnouncementCount(0);
                    setUnreadCommunityNotificationCount(0);
                    setTotalUnreadCount(0);
                }
                return !prev;
            });
        };
    
        return (
            <div className="notification-bell">
                <h3 className='border-b-2 text-left'>Notifications</h3>
                <div className="notification-dropdown max-h-40 overflow-auto w-full">
                    {( unreadAnnouncementCount + unreadEventCount + unreadApprovalCount + unreadOrganizationAnnouncementCount + unreadCommunityNotificationCount) > 0 && (
                        <span className="notification-count"></span>
                    )}
                    {( announcementNotifications.length + eventNotifications.length + organizationAnnouncementNotifications.length+communityNotifications.length) > 0 ? (
                        <ul>
                            
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
                            {console.log("Community Notifications:", communityNotifications)}
                              {communityNotifications.slice(0, 5).map((notification, index) => (
                                <div className="flex justify-between my-3" key={index}>
                                    <div className="avatar">
                                        <div className="w-10 mask mask-squircle">
                                            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="avatar" />
                                        </div>
                                    </div>
                                    <div className="div">
                                        <li>
                                            New community announcement: {notification.announcementHeader} by {notification.posterName}
                                        </li>
                                    </div>
                                </div>
                            ))}
                            
                        </ul>
                    ) : (
                        <p className=' my-2'>No new notifications</p>
                    )}
                </div>
               
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
                {latestCommunityNotification && (
                    <div className="notification-popup">
                        <p>New community announcement: {latestCommunityNotification.announcementHeader} by {latestCommunityNotification.posterName}</p>
                    </div>
                )}
    
                <div className="flex flex-row justify-starts mt-1">
                    <Link to="/notif-module" className='btn-link p-0'>
                        <p className=''><FontAwesomeIcon  icon={faList} />   See Notifications</p>
                    </Link>
                </div>
            </div>
        );
    };
    
    export default NotificationBell;
    