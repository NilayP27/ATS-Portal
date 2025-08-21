import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditProject.css';

const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showEditRoleForm, setShowEditRoleForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'project' or {type: 'role', index: number}

  const token = localStorage.getItem('token');
  const roleFromStorage = localStorage.getItem('role');

  const [projectForm, setProjectForm] = useState({
    clientName: '',
    projectName: '',
    location: '',
    type: 'Staffing',
    startDate: '',
    lead: '',
    status: 'ACTIVE'
  });

  const [newRoleForm, setNewRoleForm] = useState({
    title: '',
    location: '',
    salary: '',
    currency: 'USD',
    deadline: '',
    startDate: '',
    endDate: '',
    file: null
  });

  // helper: format value for <input type="date">
  const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setUserRole(roleFromStorage || 'User');
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, roleFromStorage, projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data);
      setProjectForm({
        clientName: response.data.clientName || '',
        projectName: response.data.projectName || '',
        location: response.data.location || '',
        type: response.data.type || 'Staffing',
        startDate: response.data.startDate || '',
        lead: response.data.lead || '',
        status: response.data.status || 'ACTIVE'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      setLoading(false);
    }
  };

  const canEditProject = ['Admin', 'Project Initiator'].includes(userRole);

  const handleProjectFormChange = (field) => (e) => {
    setProjectForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNewRoleFormChange = (field) => (e) => {
    setNewRoleForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNewRoleFileChange = (e) => {
    setNewRoleForm((prev) => ({ ...prev, file: e.target.files[0] || null }));
  };

  const handleUpdateProject = async () => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${projectId}`, projectForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project updated successfully!');
      setShowEditProjectForm(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleAddRole = async () => {
    try {
      const formData = new FormData();
      // ✅ send fields explicitly and file as "jobDescFile" (backend expects this key)
      formData.append('title', newRoleForm.title || '');
      formData.append('location', newRoleForm.location || '');
      formData.append('salary', newRoleForm.salary || '');
      formData.append('currency', newRoleForm.currency || 'USD');
      formData.append('deadline', newRoleForm.deadline || '');
      formData.append('startDate', newRoleForm.startDate || '');
      formData.append('endDate', newRoleForm.endDate || '');
      if (newRoleForm.file) formData.append('jobDescFile', newRoleForm.file);

      await axios.put(`http://localhost:5000/api/projects/${projectId}/roles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Role added successfully!');
      setShowAddRoleForm(false);
      setNewRoleForm({
        title: '',
        location: '',
        salary: '',
        currency: 'USD',
        deadline: '',
        startDate: '',
        endDate: '',
        file: null
      });
      fetchProject();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    }
  };

  const handleDeleteRole = (roleIndex) => {
    setDeleteTarget({ type: 'role', index: roleIndex });
    setShowDeleteConfirm(true);
  };

  const handleDeleteProject = () => {
    setDeleteTarget('project');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (deleteTarget === 'project') {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project deleted successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    } else if (deleteTarget?.type === 'role') {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}/roles/${deleteTarget.index}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Role deleted successfully!');
        fetchProject();
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role');
      }
    }
    setDeleteTarget(null);
  };

  const handleEditRole = async () => {
    if (!editingRole) return;
    try {
      const formData = new FormData();
      // ✅ only append known fields and file under expected key
      formData.append('title', editingRole.title || '');
      formData.append('location', editingRole.location || '');
      formData.append('salary', editingRole.salary || '');
      formData.append('currency', editingRole.currency || 'USD');
      formData.append('deadline', editingRole.deadline || '');
      formData.append('startDate', editingRole.startDate || '');
      formData.append('endDate', editingRole.endDate || '');
      if (editingRole.file) formData.append('jobDescFile', editingRole.file);

      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/roles/${editingRole.index}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Role updated successfully!');
      setShowEditRoleForm(false);
      setEditingRole(null);
      fetchProject();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleEditRoleFormChange = (field) => (e) => {
    setEditingRole((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditRoleFileChange = (e) => {
    setEditingRole((prev) => ({ ...prev, file: e.target.files[0] || null }));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  return (
    <div className="edit-project-container">
      <div className="back-button-container">
        <button onClick={() => navigate(`/project-review/${projectId}`)} className="back-button">
          ← Back to Project
        </button>
      </div>

      <h2>Edit Project: {project.projectName}</h2>
      <p className="subtext">Modify project details and manage roles</p>

      {canEditProject && (
        <div className="action-buttons">
          <button className="btn edit-btn" onClick={() => setShowEditProjectForm(true)}>Edit Project Details</button>
          <button className="btn add-btn" onClick={() => setShowAddRoleForm(true)}>+ Add New Role</button>
          <button className="btn delete-btn" onClick={handleDeleteProject}>Delete Project</button>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Project Details</h3>
            <div className="form-grid">
              <input type="text" placeholder="Client Name" value={projectForm.clientName} onChange={handleProjectFormChange('clientName')} />
              <input type="text" placeholder="Project Name" value={projectForm.projectName} onChange={handleProjectFormChange('projectName')} />
              <input type="text" placeholder="Location" value={projectForm.location} onChange={handleProjectFormChange('location')} />
              <select value={projectForm.type} onChange={handleProjectFormChange('type')}>
                <option value="Staffing">Staffing</option>
                <option value="Consulting">Consulting</option>
              </select>
              <input type="date" value={toDateInput(projectForm.startDate)} onChange={handleProjectFormChange('startDate')} />
              <input type="text" placeholder="Lead Name" value={projectForm.lead} onChange={handleProjectFormChange('lead')} />
              <select value={projectForm.status} onChange={handleProjectFormChange('status')}>
                <option value="ACTIVE">Active</option>
                <option value="HOLD">Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={() => setShowEditProjectForm(false)}>Cancel</button>
              <button className="btn edit-btn" onClick={handleUpdateProject}>Update Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Role</h3>
            <div className="form-grid">
              <input type="text" placeholder="Role Title" value={newRoleForm.title} onChange={handleNewRoleFormChange('title')} />
              <input type="text" placeholder="Location" value={newRoleForm.location} onChange={handleNewRoleFormChange('location')} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="Salary" value={newRoleForm.salary} onChange={handleNewRoleFormChange('salary')} style={{ flex: 1 }} />
                <select value={newRoleForm.currency} onChange={handleNewRoleFormChange('currency')}>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="MYR">MYR</option>
                  <option value="AED">AED</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              <input type="date" placeholder="Deadline" value={toDateInput(newRoleForm.deadline)} onChange={handleNewRoleFormChange('deadline')} />
              <input type="date" placeholder="Start Date" value={toDateInput(newRoleForm.startDate)} onChange={handleNewRoleFormChange('startDate')} />
              <input type="date" placeholder="End Date" value={toDateInput(newRoleForm.endDate)} onChange={handleNewRoleFormChange('endDate')} />
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleNewRoleFileChange} />
            </div>
            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={() => setShowAddRoleForm(false)}>Cancel</button>
              <button className="btn add-btn" onClick={handleAddRole}>Add Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleForm && editingRole && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Role{editingRole.title ? `: ${editingRole.title}` : ''}</h3>
            <div className="form-grid">
              <input type="text" placeholder="Role Title" value={editingRole.title || ''} onChange={handleEditRoleFormChange('title')} />
              <input type="text" placeholder="Location" value={editingRole.location || ''} onChange={handleEditRoleFormChange('location')} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="Salary" value={editingRole.salary || ''} onChange={handleEditRoleFormChange('salary')} style={{ flex: 1 }} />
                <select value={editingRole.currency || 'USD'} onChange={handleEditRoleFormChange('currency')}>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="MYR">MYR</option>
                  <option value="AED">AED</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              <input type="date" placeholder="Deadline" value={toDateInput(editingRole.deadline)} onChange={handleEditRoleFormChange('deadline')} />
              <input type="date" placeholder="Start Date" value={toDateInput(editingRole.startDate)} onChange={handleEditRoleFormChange('startDate')} />
              <input type="date" placeholder="End Date" value={toDateInput(editingRole.endDate)} onChange={handleEditRoleFormChange('endDate')} />
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleEditRoleFileChange} />
            </div>
            <div className="modal-actions">
              <button
                className="btn cancel-btn"
                onClick={() => {
                  setShowEditRoleForm(false);
                  setEditingRole(null);
                }}
              >
                Cancel
              </button>
              <button className="btn edit-btn" onClick={handleEditRole}>Update Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {deleteTarget === 'project' ? 'this project' : 'this role'}? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
              >
                Cancel
              </button>
              <button className="btn delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h3>Current Roles</h3>
      <div className="roles-grid">
        {(project.roles || []).map((role, index) => (
          <div key={index} className="role-card">
            <div className="role-header">
              <h4>{role.title}</h4>
              {canEditProject && (
                <div className="role-actions">
                  <button
                    className="btn small edit-btn"
                    onClick={() => {
                      setEditingRole({ ...role, index });
                      setShowEditRoleForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn small delete-btn" onClick={() => handleDeleteRole(index)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="role-details">
              <p><strong>Location:</strong> {role.location}</p>
              <p><strong>Salary:</strong> {role.currency} {role.salary}</p>
              <p><strong>Deadline:</strong> {role.deadline ? new Date(role.deadline).toLocaleDateString() : '-'}</p>
              <p><strong>Start Date:</strong> {role.startDate ? new Date(role.startDate).toLocaleDateString() : '-'}</p>
              <p><strong>End Date:</strong> {role.endDate ? new Date(role.endDate).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
};

export default EditProject;