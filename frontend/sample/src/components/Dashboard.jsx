import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project-review/${projectId}`);
  };

  // Function to render project cards based on status
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
          {renderProjectsByStatus('ACTIVE')}
        </div>

        {/* Projects on Hold */}
        <div className={styles.card}>
          <h3>Projects on Hold</h3>
          <p className={styles.cardSubtitle}>Temporarily paused</p>
          {renderProjectsByStatus('HOLD')}
        </div>

        {/* Completed Projects */}
        <div className={styles.card}>
          <h3>Completed Projects</h3>
          <p className={styles.cardSubtitle}>Successfully finished</p>
          {renderProjectsByStatus('COMPLETED')}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
