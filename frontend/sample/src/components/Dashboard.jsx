import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
    
    // Set up periodic refresh of notifications (every 30 seconds)
    const notificationInterval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(notificationInterval);
  }, []);

  const fetchProjects = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const projectsWithStats = await Promise.all(
      res.data.map(async (project) => {
        try {
          const statsRes = await axios.get(
            `http://localhost:5000/api/candidates/dashboard/${project._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...project, ...statsRes.data };
        } catch {
          return { ...project, pipeline: {}, totalPositions: 0, filledPositions: 0 };
        }
      })
    );

    setProjects(projectsWithStats);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10, unreadOnly: false }
      });
      
      // Transform notifications to match the expected format
      const transformedNotifications = res.data.map(notification => ({
        id: notification._id,
        text: notification.message,
        title: notification.title,
        type: notification.type,
        priority: notification.priority,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        projectId: notification.projectId?._id,
        projectName: notification.projectId?.projectName
      }));
      
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Fallback to empty notifications if API fails
      setNotifications([]);
    }
  };

  const handleCreateProject = () => navigate('/create-project');
  const handleProjectClick = (projectId) =>
    navigate(`/project-review/${projectId}`);

  const handleLogout = () => {
    toast.info('Logging out...', {
      position: 'top-center',
      autoClose: 1500,
    });

    setTimeout(() => {
      localStorage.clear();
      navigate('/');
    }, 1000);
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch("http://localhost:5000/api/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(note => ({ ...note, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      toast.error('Failed to mark notifications as read');
    }
  };

  const renderProjectsByStatus = (status) =>
    projects
      .filter((project) => project.status === status)
      .map((project) => (
        <div
          key={project._id}
          className={styles.projectBox}
          onClick={() => handleProjectClick(project._id)}
        >
          {/* Project header */}
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
              {project.status === 'ACTIVE'
                ? 'ACTIVE'
                : project.status === 'HOLD'
                ? 'ON HOLD'
                : 'Completed'}
            </span>
          </div>

          {/* Project details */}
          <div className={styles.projectDetails}>
            <p>
              Roles:{' '}
              <span className={styles.blueText}>
                {project.rolesRequested || 0}
              </span>{' '}
              | Candidates:{' '}
              <span className={styles.blueText}>
                {project.candidatesCount || 0}
              </span>
            </p>
            <p>
              Recruiter Lead:{' '}
              <span className={styles.boldText}>{project.lead || 'N/A'}</span>
            </p>
            <p>
              Progress: {project.filledPositions || 0}/
              {project.totalPositions || 0} positions filled
            </p>
          </div>

          {/* Interview Pipeline */}
          <div className={styles.pipeline}>
            <p>Interview Pipeline:</p>
            <div className={styles.pipelineStages}>
              {['L0','L1','L2','Selected'].map((stage) => (
                <span key={stage} className={styles.pipelineStage}>
                  {stage}: {project.pipeline?.[stage] || 0}
                </span>
              ))}
            </div>
          </div>
        </div>
      ));

  return (
    <div className={styles.dashboardPage}>
      <ToastContainer />

      <Header
        username={username}
        notifications={notifications}
        handleLogout={handleLogout}
        onMarkAllAsRead={markAllNotificationsAsRead}
      />

      <div className={styles.dashboardWrapper}>
        <div className={styles.sidebar}>
          {['Admin', 'Project Initiator'].includes(role) && (
            <button
              className={styles.createButton}
              onClick={handleCreateProject}
            >
              + Create Project
            </button>
          )}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>Team Dashboard</h2>
            <p className={styles.subtitle}>Manage your recruitment projects</p>
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
    </div>
  );
};

export default Dashboard;
