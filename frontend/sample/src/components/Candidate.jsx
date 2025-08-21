import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateList.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CandidateList = () => {
  const navigate = useNavigate();
  const { roleTitle, projectId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    interviewLevel: "L1",
    resume: null,
  });

  const token = localStorage.getItem("token");
  const roleFromStorage = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      setUserRole(roleFromStorage || "User");
    }
  }, [token, navigate, roleFromStorage]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/candidates/by-project-role/${projectId}/${encodeURIComponent(
            roleTitle
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCandidates(res.data || []);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        if (error.response?.status === 403) {
          alert("Access denied: You do not have permission to view this page");
          navigate("/dashboard");
        }
      }
    };

    if (token) {
      fetchCandidates();
    }
  }, [roleTitle, projectId, token, navigate]);

  const handleCandidateClick = (candidateId) => {
    navigate(`/candidate-feedback/${candidateId}`);
  };

  const handleLevelChange = async (candidateId, newLevel) => {
    try {
      await axios.put(
        `http://localhost:5000/api/candidates/${candidateId}/interview-level`,
        { interviewLevel: newLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, interviewLevel: newLevel } : c
        )
      );
    } catch (err) {
      console.error("Error updating interview level:", err);
      if (err.response?.status === 403) {
        alert("You are not authorized to update candidate levels");
      }
    }
  };

  const handleInputChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewCandidate({ ...newCandidate, resume: e.target.files[0] });
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newCandidate.name);
      formData.append("email", newCandidate.email);
      formData.append("phone", newCandidate.phone);
      formData.append("interviewLevel", newCandidate.interviewLevel);
      formData.append("projectId", projectId);
      formData.append("roleTitle", roleTitle);
      if (newCandidate.resume) {
        formData.append("resume", newCandidate.resume);
      }

      const res = await axios.post(
        "http://localhost:5000/api/candidates",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const addedCandidate = res.data.candidate || res.data;
      setCandidates([...candidates, addedCandidate]);
      setNewCandidate({
        name: "",
        email: "",
        phone: "",
        interviewLevel: "L1",
        resume: null,
      });
      setShowForm(false);
      toast.success("Candidate added successfully!");
    } catch (error) {
      console.error(
        "Error adding candidate:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to add candidate: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const canEditLevels = ["Admin", "Recruiter Lead", "Recruiter"].includes(
    userRole
  );

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="header">
        <span
          className="back-arrow"
          onClick={() => navigate(`/project-review/${projectId}`)}
        >
          &#8592;
        </span>
        <div>
          <h1 className="title">{roleTitle}</h1>
          <p className="subtitle">Candidate overview and progress</p>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "10px 16px",
            background: "linear-gradient(to right, #4d4dff, #706cff)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          + New Candidate
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Candidate</h2>
            <form onSubmit={handleAddCandidate}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={newCandidate.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newCandidate.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={newCandidate.phone}
                onChange={handleInputChange}
                required
              />
              <select
                name="interviewLevel"
                value={newCandidate.interviewLevel}
                onChange={handleInputChange}
              >
                <option value="L1">L1 - Technical Assessment/First Round</option>
                <option value="L2">L2 - Technical Interview/Second Round</option>
                <option value="L3">L3 - System Design/Architecture Round</option>
                <option value="L4">L4 - Managerial/Leadership Interview</option>
                <option value="L5">L5 - Cultural Fit/HR Interview</option>
                <option value="L6">L6 - Final Interview/Director Level</option>
              </select>

              <label
                htmlFor="resume-upload"
                style={{ marginTop: "10px", fontWeight: "500" }}
              >
                Upload Resume:
              </label>
              <input
                id="resume-upload"
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ marginTop: "5px" }}
              />

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save Candidate
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Candidates</h2>
        {candidates.length === 0 ? (
          <p>No candidates available for this role.</p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate._id}
              className="candidate-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                onClick={() => handleCandidateClick(candidate._id)}
                style={{ cursor: "pointer" }}
              >
                <strong>{candidate.name}</strong>
                <p>Email: {candidate.email || "N/A"}</p>
                <p>Phone: {candidate.phone || "N/A"}</p>
                <p>Current Stage: {candidate.interviewLevel}</p>
              </div>

              {canEditLevels && (
                <select
                  value={candidate.interviewLevel}
                  onChange={(e) =>
                    handleLevelChange(candidate._id, e.target.value)
                  }
                  style={{ padding: "6px 12px", borderRadius: "6px" }}
                >
                  <option value="L1">L1 - Technical Assessment/First Round</option>
                  <option value="L2">L2 - Technical Interview/Second Round</option>
                  <option value="L3">L3 - System Design/Architecture Round</option>
                  <option value="L4">L4 - Managerial/Leadership Interview</option>
                  <option value="L5">L5 - Cultural Fit/HR Interview</option>
                  <option value="L6">L6 - Final Interview/Director Level</option>
                </select>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateList;
