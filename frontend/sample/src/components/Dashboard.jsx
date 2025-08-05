import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell } from 'react-icons/fa'; // ✅ import bell icon

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    fetchProjects();
    fetchNotifications(); // load notifications
  }, []);
  useEffect(() => {
    // ✅ Close notifications dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.notificationWrapper}`)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchNotifications = async () => {
    // Dummy static notifications for now
    setNotifications([
      { id: 1, text: 'New project assigned: Alpha' },
      { id: 2, text: 'Role closed in Beta project' },
      { id: 3, text: 'System maintenance at 10PM' }
    ]);
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project-review/${projectId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const renderProjectsByStatus = (status) =>
    projects
      .filter((project) => project.status === status)
      .map((project) => {
        const rolesRequested = project.roles?.length || 0;
        const rolesClosed = project.roles?.filter(role => role.status === 'CLOSED')?.length || 0;

        return (
          <div
            key={project._id}
            className={styles.projectBox}
            onClick={() => handleProjectClick(project._id)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.projectHeader}>
              <strong>{project.name}</strong>
              <span
                className={
                  project.status === 'ACTIVE'
                    ? styles.statusActive
                    : project.status === 'HOLD'
                    ? styles.statusHold
                    : styles.statusCompleted
                }
              >
                {project.status}
              </span>
            </div>
            <div className={styles.projectDetails}>
              <p>
                Roles Requested:{' '}
                <span className={styles.blueText}>{rolesRequested}</span>
              </p>
              <p>
                Roles Closed:{' '}
                <span className={styles.greenText}>{rolesClosed}</span>
              </p>
              <p>
                Lead: <span className={styles.boldText}>{project.lead || 'N/A'}</span>
              </p>
            </div>
          </div>
        );
      });

  return (
    <div className={styles.dashboardWrapper}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>ATS VDart</h2>
        <button className={styles.createButton} onClick={handleCreateProject}>
          + Create Project
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.welcome}>
            Welcome, <strong>{username}</strong>
          </div>

          <div className={styles.topRight}>
            {/* Notification Bell */}
            <div className={styles.notificationWrapper}>
  <FaBell className={styles.notificationIcon} onClick={toggleNotifications} />
  {notifications.length > 0 && (
    <span className={styles.notificationBadge}>{notifications.length}</span>
  )}
  <div
    className={`${styles.notificationDropdown} ${
      showNotifications ? styles.show : ''
    }`}
  >
    {notifications.length > 0 ? (
      notifications.map((note) => (
        <div key={note.id} className={styles.notificationItem}>
          {note.text}
        </div>
      ))
    ) : (
      <div className={styles.notificationItem}>No new notifications</div>
    )}
  </div>
</div>



            {/* Logout */}
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Header and Cards */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Team Dashboard</h2>
            <p className={styles.subtitle}>Manage your recruitment projects</p>
          </div>
        </div>

        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Active Projects</h3>
              <p className={styles.cardSubtitle}>Currently in progress</p>
            </div>
            {renderProjectsByStatus('ACTIVE')}
          </div>

          <div className={styles.card}>
            <h3>Projects on Hold</h3>
            <p className={styles.cardSubtitle}>Temporarily paused</p>
            {renderProjectsByStatus('HOLD')}
          </div>

          <div className={styles.card}>
            <h3>Completed Projects</h3>
            <p className={styles.cardSubtitle}>Successfully finished</p>
            {renderProjectsByStatus('COMPLETED')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
