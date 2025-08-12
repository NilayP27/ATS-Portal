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
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchNotifications = async () => {
    setNotifications([
      { id: 1, text: 'New project assigned: Alpha' },
      { id: 2, text: 'Role closed in Beta project' },
      { id: 3, text: 'System maintenance at 10PM' },
    ]);
  };

  const handleCreateProject = () => navigate('/create-project');
  const handleProjectClick = (projectId) => navigate(`/project-review/${projectId}`);

  const handleLogout = () => {
    toast.info('Logging out...', {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
    });

    setTimeout(() => {
      localStorage.clear();
      navigate('/');
    }, 1000);
  };

  const renderProjectsByStatus = (status) =>
    projects
      .filter((project) => project.status === status)
      .map((project) => {
        const rolesRequested = project.roles?.length || 0;
        const rolesClosed =
          project.roles?.filter((role) => role.status === 'CLOSED')?.length || 0;

        return (
          <div
            key={project._id}
            className={styles.projectBox}
            onClick={() => handleProjectClick(project._id)}
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
                Roles Requested: <span className={styles.blueText}>{rolesRequested}</span>
              </p>
              <p>
                Roles Closed: <span className={styles.greenText}>{rolesClosed}</span>
              </p>
              <p>
                Lead: <span className={styles.boldText}>{project.lead || 'N/A'}</span>
              </p>
            </div>
          </div>
        );
      });

  return (
    <div className={styles.dashboardPage}>
      {/* Toastify container */}
      <ToastContainer />

      <Header
        username={username}
        notifications={notifications}
        handleLogout={handleLogout}
      />

      <div className={styles.dashboardWrapper}>
        <div className={styles.sidebar}>
          {['Admin', 'Project Initiator'].includes(role) && (
            <button className={styles.createButton} onClick={handleCreateProject}>
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
