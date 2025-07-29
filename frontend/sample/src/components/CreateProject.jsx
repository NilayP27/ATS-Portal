import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateProject.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateProjectForm = () => {
  const [roles, setRoles] = useState([{}]);
  const navigate = useNavigate();

  const handleAddRole = () => {
    setRoles([...roles, {}]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer} onClick={() => navigate(-1)}>
        <ArrowBackIcon className={styles.backIcon} />
        <span className={styles.backText}>Back</span>
      </div>

      <h2>Create New Project</h2>
      <p className={styles.subtitle}>Set up a new recruitment project</p>

      <div className={styles.formGrid}>
        <input type="text" placeholder="Enter client name" className={styles.input} />
        <input type="text" placeholder="Enter project name" className={styles.input} />
        <input type="text" placeholder="Enter location" className={styles.input} />
        <select className={styles.input}>
          <option value="Staffing">Staffing</option>
          <option value="Consulting">Project</option>
        </select>
        <input type="date" className={styles.input} />
      </div>

      <h3>Roles Required</h3>
      <p className={styles.subtitle}>Define the positions you need to fill</p>

      {roles.map((_, index) => (
        <div key={index} className={styles.roleCard}>
          <h4>Role {index + 1}</h4>
          <div className={styles.roleGrid}>
            <input type="text" placeholder="e.g. Frontend Developer" className={styles.input} />
            <input type="text" placeholder="e.g. New York" className={styles.input} />
            <div className={styles.inlineInput}>
              <input type="number" placeholder="80000" className={styles.input} />
              <select className={styles.currencySelect}>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="MYR">MYR</option>
                <option value="AED">AED</option>
                <option value="CAD">CAD</option>
                
              </select>
            </div>
            <input type="date" className={styles.input} placeholder="Deadline" />
            <input type="date" className={styles.input} placeholder="Start Date" />
            <input type="date" className={styles.input} placeholder="End Date" />
            <div className={styles.fileInputContainer}>
  <label htmlFor={`jobDescFile-${index}`} className={styles.fileLabel}>
    Upload the file for Job Description
  </label>
  <input type="file" id={`jobDescFile-${index}`} className={styles.inputFile} />
</div>

          </div>
        </div>
      ))}

      <button className={styles.addRoleButton} onClick={handleAddRole}>+ Add Role</button>
      <button className={styles.createProjectButton}>Create Project</button>
    </div>
  );
};

export default CreateProjectForm;
