//notification page

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css';
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { MdOutlineMarkChatRead } from "react-icons/md";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className='page_container'>
      <NavBar />
      <div className='notifications_wrapper'>
        <h2 className='notifications_title'>Notifications</h2>
        {notifications.length === 0 ? (
          <div className='not_found_box'>
            <div className='not_found_img'></div>
            <p className='not_found_msg'>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification_card ${notification.read ? 'read' : 'unread'}`}>
              <div className='notification_content'>
                <div className='notification_text'>
                  <p className='notification_message'>{notification.message}</p>
                  <p className='notification_time'>{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className='notification_actions'>
                  {!notification.read && (
                    <MdOutlineMarkChatRead
                      onClick={() => handleMarkAsRead(notification.id)}
                      className='action_icon mark_icon'
                      title='Mark as Read'
                    />
                  )}
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(notification.id)}
                    className='action_icon delete_icon'
                    title='Delete Notification'
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
