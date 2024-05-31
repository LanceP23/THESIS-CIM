import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-daisyui';
import axios from 'axios';

const Notification_module = () => {
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
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className='animate-fade-in'>
      <div className="bg-slate-100 p-3 my-5 rounded-3xl shadow-inner shadow-slate-950">
        <h2 className='text-3xl text-green-800 border-b-2 border-yellow-500 py-2'>
          <FontAwesomeIcon icon={faBell} className=' text-yellow-500 mx-1' />
          Notification
        </h2>

        <div className="div">
          <table className="max-w-full">
            {/* head */}
            <thead className=''>
              <tr className=' '>
                <th className='bg-customgreen_1 text-white text-left'>
                  <label>
                    <input type="checkbox" className="checkbox border" />
                  </label>
                </th>
                <th className='bg-customgreen_1 text-white text-left'>#</th>
                <th className='bg-customgreen_1 text-white text-left'>From</th>
                <th className='bg-customgreen_1 text-white text-left'>Subject</th>
                <th className='bg-customgreen_1 text-white text-left'>Sent</th>
                <th className='bg-customgreen_1 text-white text-left'>Read?</th>
              </tr>
            </thead>
            <tbody className=''>
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
                          <img src="https://img.daisyui.com/tailwind-css-component-profile-2@56w.png" alt="Avatar Tailwind CSS Component" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{notification.posterName}</div>
                        {/* Assuming you have country or other info in the notification */}
                        <div className="text-sm opacity-50">United States</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Link to='' className='btn-link'>
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
      </div>
    </div>
  );
}

export default Notification_module;
