import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css';
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { MdOutlineMarkChatRead } from "react-icons/md";

function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        const fetchedData = response.data;
        setNotificationsList(fetchedData);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    if (userId) {
      fetchNotifications();
    }

  }, [userId]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${notifId}/markAsRead`);
      setNotificationsList((prevList) =>
        prevList.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${notifId}`);
      setNotificationsList((prevList) => prevList.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className='page_container'>
      <NavBar />

      <div className='notifications_wrapper'>
        <h2 className='notifications_title'>Notifications</h2>

        {notificationsList.length === 0 ? (
          <div className='not_found_box'>
            <div className='not_found_img'></div>
            <p className='not_found_msg'>No notifications yet.</p>
          </div>
        ) : (
          notificationsList.map((notif) => (
            <div
              key={notif.id}
              className={`notification_card ${notif.read ? 'read' : 'unread'}`}
            >
              <div className='notification_content'>
                <div className='notification_text'>
                  <p className='notification_message'>{notif.message}</p>
                  <p className='notification_time'>{new Date(notif.createdAt).toLocaleString()}</p>
                </div>

                <div className='notification_actions'>
                  {!notif.read && (
                    <MdOutlineMarkChatRead
                      onClick={() => handleMarkAsRead(notif.id)}
                      className='action_icon mark_icon'
                      title='Mark as Read'
                    />
                  )}
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(notif.id)}
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
