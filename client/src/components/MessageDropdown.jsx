import React, { useState, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useAnnouncementNotifications from '../hooks/useAnnouncementNotifications';
import useEventNotifications from '../hooks/useEventNotifications';
import useApprovalNotifications from '../hooks/useApprovalNotifications';
import useOrganizationAnnouncementNotifications from '../hooks/useOrganizationAnnouncementNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'; // Changed to message icon
import { Link } from 'react-router-dom';
import useCommunityNotification from '../hooks/useCommunityNotification';
import axios from 'axios';

const MessageDropdown = ({ setTotalUnreadMessages }) => {
    const messageNotifications = useNotifications();
    
    
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    
    const [latestMessage, setLatestMessage] = useState(null); 
   
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
          setUnreadMessageCount(savedNotifications.unreadMessageCount || 0);
          setLatestMessage(savedNotifications.latestMessage || null);
        }
      }, []);
    
      useEffect(() => {
        const notifications = { unreadMessageCount, latestMessage };
        localStorage.setItem('notifications', JSON.stringify(notifications));
      }, [unreadMessageCount, latestMessage]);
    
      useEffect(() => {
        setUnreadMessageCount(messageNotifications.length);
      }, [messageNotifications]);
    
      useEffect(() => {
        if (messageNotifications.length > 0) {
          setLatestMessage(`New message from ${messageNotifications[0].senderName}: ${messageNotifications[0].message}`);
          setTimeout(() => {
            setLatestMessage(null);
          }, 5000);
        }
      }, [messageNotifications]);
    
      useEffect(() => {
        const totalUnreadMessages = unreadMessageCount;
        setTotalUnreadMessages(totalUnreadMessages);
      }, [unreadMessageCount, setTotalUnreadMessages]);
    
      const toggleDropdown = () => {
        setUnreadMessageCount(0);
        setTotalUnreadMessages((prev) => prev - unreadMessageCount);
      };

    return (
        <div className="">
        <div className="notification-bell bg-gray-300 p-3 rounded-md">
            <h3 className='border-b-2 text-left text-black'>Messages</h3>
            <div className="notification-dropdown max-h-48 overflow-auto w-full">
                {(unreadMessageCount) > 0 && (
                    <span className="notification-count"></span>
                )}
                {(messageNotifications.length ) > 0 ? (
                    <ul>
                        {messageNotifications.slice().reverse().map((notification, index) => (
                            <div className="flex justify-between my-3 border-b-2 pb-2" key={index}>
                                <div className="div text-black ">
                                    <li>
                                        New message from {notification.senderName}: {notification.message}
                                    </li>
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p className=' my-2 text-black'>No new messages</p>
                )}
            </div>
            {latestMessage && (
                <div className="notification-popup">
                    <p>{latestMessage}</p>
                </div>
            )}

           
        </div>
        <div className="flex flex-row justify-starts mt-1">
                <Link to="/campcomms" className='btn-link p-0'>
                    <p className=''><FontAwesomeIcon icon={faEnvelope} /> See Messages</p> 

                </Link>
            </div>
        </div>
    );
};

export default MessageDropdown;
