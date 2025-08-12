// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ username, notifications, handleLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Get role from localStorage
  const role = localStorage.getItem('role') || 'User';

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
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
          {notifications.length > 0 && (
            <span className={styles.notificationBadge}>{notifications.length}</span>
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
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div key={note.id} className={styles.notificationItem}>
                      {note.text}
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
