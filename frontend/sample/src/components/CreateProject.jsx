import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateProject.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateProjectForm = () => {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Staffing');
  const [startDate, setStartDate] = useState('');
  const [lead, setLead] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [roles, setRoles] = useState([
    {
      title: '',
      location: '',
      salary: '',
      currency: 'USD',
      deadline: '',
      startDate: '',
      endDate: '',
      file: null,
    },
  ]);

  const navigate = useNavigate();

  const handleAddRole = () => {
    setRoles([
      ...roles,
      {
        title: '',
        location: '',
        salary: '',
        currency: 'USD',
        deadline: '',
        startDate: '',
        endDate: '',
        file: null,
      },
    ]);
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...roles];
    updatedRoles[index][field] = value;
    setRoles(updatedRoles);
  };

  const handleFileChange = (index, file) => {
    const updatedRoles = [...roles];
    updatedRoles[index].file = file;
    setRoles(updatedRoles);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    roles.forEach((role) => {
      if (role.file) {
        formData.append('jobDescFiles', role.file);
      }
    });

    const projectData = {
      clientName,
      projectName,
      location,
      type,
      startDate,
      lead,
      status,
      roles: roles.map(role => {
        const roleCopy = { ...role };
        delete roleCopy.file;
        return roleCopy;
      }),
    };

    formData.append('data', JSON.stringify(projectData));

    try {
      await axios.post('http://localhost:5000/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('✅ Project created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('❌ Failed to create project. Please try again.');
    }
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
        <input
          type="text"
          placeholder="Enter client name"
          className={styles.input}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter project name"
          className={styles.input}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter location"
          className={styles.input}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select className={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Staffing">Staffing</option>
          <option value="Consulting">Project</option>
        </select>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Requisition Date</label>
          <input
            type="date"
            className={styles.input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <input
          type="text"
          placeholder="Enter lead name"
          className={styles.input}
          value={lead}
          onChange={(e) => setLead(e.target.value)}
        />
        <select
          className={styles.input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ACTIVE">Active</option>
          <option value="HOLD">Hold</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <h3>Roles Required</h3>
      <p className={styles.subtitle}>Define the positions you need to fill</p>

      {roles.map((role, index) => (
        <div key={index} className={styles.roleCard}>
          <h4>Role {index + 1}</h4>
          <div className={styles.roleGrid}>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              className={styles.input}
              value={role.title}
              onChange={(e) => handleRoleChange(index, 'title', e.target.value)}
            />
            <input
              type="text"
              placeholder="e.g. New York"
              className={styles.input}
              value={role.location}
              onChange={(e) => handleRoleChange(index, 'location', e.target.value)}
            />
            <div className={styles.inlineInput}>
              <input
                type="number"
                placeholder="80000"
                className={styles.input}
                value={role.salary}
                onChange={(e) => handleRoleChange(index, 'salary', e.target.value)}
              />
              <select
                className={styles.currencySelect}
                value={role.currency}
                onChange={(e) => handleRoleChange(index, 'currency', e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="MYR">MYR</option>
                <option value="AED">AED</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Deadline</label>
              <input
                type="date"
                className={styles.input}
                value={role.deadline}
                onChange={(e) => handleRoleChange(index, 'deadline', e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                className={styles.input}
                value={role.startDate}
                onChange={(e) => handleRoleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                className={styles.input}
                value={role.endDate}
                onChange={(e) => handleRoleChange(index, 'endDate', e.target.value)}
              />
            </div>
            <div className={styles.fileInputContainer}>
              <label htmlFor={`jobDescFile-${index}`} className={styles.fileLabel}>
                Upload the file for Job Description
              </label>
              <input
                type="file"
                id={`jobDescFile-${index}`}
                className={styles.inputFile}
                onChange={(e) => handleFileChange(index, e.target.files[0])}
              />
            </div>
          </div>
        </div>
      ))}

      <button className={styles.addRoleButton} onClick={handleAddRole}>
        + Add Role
      </button>
      <button className={styles.createProjectButton} onClick={handleSubmit}>
        Create Project
      </button>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CreateProjectForm;
