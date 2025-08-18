// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ username, notifications, handleLogout, onMarkAllAsRead }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // ✅ Get role from localStorage
  const role = localStorage.getItem('role') || 'User';

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(note => !note.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Update local state to mark as read
        notification.isRead = true;
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.headerBar}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>ATS VDart</div>
        <span className={styles.welcomeText}>
          Welcome, <strong>{username}</strong> <span className={styles.roleText}>({role})</span>
        </span>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.notificationWrapper} ref={dropdownRef}>
          <FaBell className={styles.notificationIcon} onClick={toggleNotifications} />
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>{unreadCount}</span>
          )}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className={styles.notificationDropdown}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {notifications.length > 0 && (
                  <div className={styles.notificationHeader}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        className={styles.markAllReadButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAllAsRead();
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                )}
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div 
                      key={note.id} 
                      className={`${styles.notificationItem} ${!note.isRead ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(note)}
                    >
                      <div className={styles.notificationTitle}>{note.title || note.text}</div>
                      <div className={styles.notificationMessage}>{note.text}</div>
                      {note.projectName && (
                        <div className={styles.notificationProject}>Project: {note.projectName}</div>
                      )}
                      <div className={styles.notificationTime}>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.notificationItem}>No notifications</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
