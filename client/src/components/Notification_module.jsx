import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-daisyui';
import axios from 'axios';

const Notification_module = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

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
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      const token = getToken();
      const response = await axios.get(`/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedNotification(response.data);

      // Update read status
      await axios.patch(`/notifications/${notificationId}/read`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state to mark notification as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error fetching notification details:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = getToken();
      await axios.patch('/notifications/markAllAsRead', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state to mark all notifications as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  return (
    <div className='animate-fade-in  mt-16 ml-12'>
      <div className="bg-slate-100 p-3 h-[85vh] rounded-3xl shadow-inner shadow-slate-950 ">
        <h2 className='text-3xl text-green-800 border-b-2 border-yellow-500 py-2'>
          <FontAwesomeIcon icon={faBell} className='text-yellow-500 mx-1' />
          Notification
        </h2>

        <div className="overflow-auto max-h-[70vh] overflow-x-auto">
          <table className="max-w-[80vw]">
            <thead>
              <tr>
                <th className='bg-customgreen_1 text-white text-left'>
                  <label>
                    <input type="checkbox" className="checkbox border" onClick={handleMarkAllAsRead} />
                  </label>
                </th>
                <th className='bg-customgreen_1 text-white text-left'>#</th>
                <th className='bg-customgreen_1 text-white text-left'>From</th>
                <th className='bg-customgreen_1 text-white text-left'>Subject</th>
                <th className='bg-customgreen_1 text-white text-left'>Sent</th>
                <th className='bg-customgreen_1 text-white text-left'>Read?</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification, index) => (
                <tr key={notification._id} className='hover:bg-yellow-200 border-b-2 text-left'>
                  <td>
                    <input type="checkbox" className="checkbox" />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src="https://img.daisyui.com/tailwind-css-component-profile-2@56w.png" alt="Avatar" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{notification.posterName}</div>
                        <div className="text-sm opacity-50">United States</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Link to='#' onClick={() => handleNotificationClick(notification._id)} className='btn-link'>
                      <p>{notification.announcementHeader}</p>
                    </Link>
                  </td>
                  <td>
                    <p>{new Date(notification.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td>
                    <p>
                      {notification.read ? (
                        <FontAwesomeIcon icon={faCheck} className='text-green-500 mx-1' />
                      ) : (
                        'Unread'
                      )}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedNotification && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 pt-24">
            <div className=" bg-slate-200 p-3 rounded-2xl shadow-lg max-w-[80vw] max-h-[70vh] text-left overflow-y-auto ">

              <div className="flex justify-around">
                <div className="grid grid-cols-2 mb-3 mt-1">
                  <h3 className="text-lg font-bold text-green-700 border-b-4 border-yellow-500">Subject: {selectedNotification.announcementHeader}</h3>
                </div>
                <div className="justify-end my-0">
                  <button onClick={closeModal} className="text-gray-600 hover:text-gray-900 text-4xl justify-end">
                    &times;
                  </button>
                </div>
              </div>

              <p><strong>Type:</strong> {selectedNotification.type}</p>
              <p className='mt-2'><strong>From:</strong> {selectedNotification.posterName}</p>
              <p className='mt-2'><strong>Timestamp:</strong> {new Date(selectedNotification.timestamp).toLocaleString()}</p>

              {selectedNotification.type === 'announcement' && (
                <>
                  <p className='mt-2'><strong>Message:</strong> {selectedNotification.message}</p>
                  <p className='mt-2'><strong>Title:</strong> {selectedNotification.announcementHeader}</p>
                  <p className='mt-2'><strong>Description:</strong> {selectedNotification.announcementBody}</p>
                </>
              )}

              {selectedNotification.type === 'event' && (
                <>
                  <p className='mt-2'><strong>By:</strong> {selectedNotification.posterName}</p>
                  <p className='mt-2'><strong>Title:</strong> {selectedNotification.eventName}</p>
                  <p className='mt-2'><strong>Starts at: </strong> {new Date(selectedNotification.timeStart).toLocaleString()}</p>
                  <p className='mt-2'><strong>Ends at: </strong> {new Date(selectedNotification.timeEnd).toLocaleString()}</p>
                  <p className='mt-2'><strong>Organizer:</strong> {selectedNotification.organizerName}</p>
                </>
              )}

              {selectedNotification.type === 'postStatus' && (
                <>
                  <p><strong>Status:</strong> {selectedNotification.postStatus}</p>
                  {selectedNotification.postStatus === "rejected" && (
                    <p><strong>Rejection Reason:</strong> {selectedNotification.rejectionReason}</p>
                  )}
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification_module;
