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
  const token = localStorage.getItem('token');

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleDynamicInputChange = (index, field) => (e) => {
    const updatedRoles = [...roles];
    updatedRoles[index][field] = e.target.value;
    setRoles(updatedRoles);
  };

  const handleFileChange = (index, file) => {
    const updatedRoles = [...roles];
    updatedRoles[index].file = file;
    setRoles(updatedRoles);
  };

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

  const handleSubmit = async () => {
    if (!token) {
      toast.error('You are not logged in. Please login again.');
      navigate('/');
      return;
    }

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
      roles: roles.map((role) => {
        const roleCopy = { ...role };
        delete roleCopy.file;
        return roleCopy;
      }),
    };

    formData.append('data', JSON.stringify(projectData));

    // Debug logs
    console.log("📦 Token:", token);
    console.log("📦 FormData entries:", [...formData.entries()]);

    try {
      await axios.post('http://localhost:5000/api/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // ✅ Added
        },
      });

      toast.success(' Project created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);

      if (error.response?.status === 401) {
        toast.error(' Unauthorized. Please log in again.');
        navigate('/');
      } else if (error.response?.status === 403) {
        toast.error(' You do not have permission to create a project.');
      } else {
        toast.error('Failed to create project. Please try again.');
      }
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
    onChange={handleInputChange(setClientName)}
  />
  <input
    type="text"
    placeholder="Enter project name"
    className={styles.input}
    value={projectName}
    onChange={handleInputChange(setProjectName)}
  />
  <input
    type="text"
    placeholder="Enter location"
    className={styles.input}
    value={location}
    onChange={handleInputChange(setLocation)}
  />
  <select className={styles.input} value={type} onChange={handleInputChange(setType)}>
    <option value="Staffing">Staffing</option>
    <option value="Consulting">Project</option>
  </select>

  <div className={styles.inputGroup}>
    <label className={styles.label}>Requisition Date</label>
    <input
      type="date"
      className={styles.input}
      value={startDate}
      onChange={handleInputChange(setStartDate)}
    />
  </div>

  <div className={styles.inputGroup}>
    <label className={styles.label}>Lead Name</label>
    <input
      type="text"
      placeholder="Enter lead name"
      className={styles.input}
      value={lead}
      onChange={handleInputChange(setLead)}
    />
  </div>

  <select className={styles.input} value={status} onChange={handleInputChange(setStatus)}>
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
              onChange={handleDynamicInputChange(index, 'title')}
            />
            <input
              type="text"
              placeholder="e.g. New York"
              className={styles.input}
              value={role.location}
              onChange={handleDynamicInputChange(index, 'location')}
            />
            <div className={styles.inlineInput}>
              <input
                type="number"
                placeholder="80000"
                className={styles.input}
                value={role.salary}
                onChange={handleDynamicInputChange(index, 'salary')}
              />
              <select
                className={styles.currencySelect}
                value={role.currency}
                onChange={handleDynamicInputChange(index, 'currency')}
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
                onChange={handleDynamicInputChange(index, 'deadline')}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                className={styles.input}
                value={role.startDate}
                onChange={handleDynamicInputChange(index, 'startDate')}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                className={styles.input}
                value={role.endDate}
                onChange={handleDynamicInputChange(index, 'endDate')}
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

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default CreateProjectForm;
