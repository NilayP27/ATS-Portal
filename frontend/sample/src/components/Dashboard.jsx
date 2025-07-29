import React from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project-review/${projectId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>VDart Team Dashboard</h2>
          <p className={styles.subtitle}>Manage your recruitment projects</p>
        </div>
        <button className={styles.createButton} onClick={handleCreateProject}>
          + Create Project
        </button>
      </div>

      <div className={styles.cardGrid}>
        {/* Active Projects */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Active Projects</h3>
            <p className={styles.cardSubtitle}>Currently in progress</p>
            <div className={styles.filterIcon}>🔍</div>
          </div>

          {/* Clickable Project Card */}
          <div
            className={styles.projectBox}
            onClick={() => handleProjectClick('alpha')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.projectHeader}>
              <strong>Project Alpha</strong>
              <span className={styles.statusActive}>ACTIVE</span>
            </div>
            <div className={styles.projectDetails}>
              <p>
                Roles Requested: <span className={styles.blueText}>3</span>
              </p>
              <p>
                Roles Closed: <span className={styles.greenText}>1</span>
              </p>
              <p>
                Lead: <span className={styles.boldText}>John Doe</span>
              </p>
            </div>
          </div>
        </div>

        {/* Projects on Hold */}
        <div className={styles.card}>
          <h3>Projects on Hold</h3>
          <p className={styles.cardSubtitle}>Temporarily paused</p>
          <div className={styles.warningBox}>
            <strong>Projects go to hold when:</strong>
            <ul>
              <li>Not updated in 3 months after deadline</li>
              <li>Manually set to hold status</li>
            </ul>
          </div>
        </div>

        {/* Completed Projects */}
        <div className={styles.card}>
          <h3>Completed Projects</h3>
          <p className={styles.cardSubtitle}>Successfully finished</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
