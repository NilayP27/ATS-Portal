import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateList.css";
import axios from "axios";

const CandidateList = () => {
  const navigate = useNavigate();
  const { roleTitle, projectId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [userRole, setUserRole] = useState("");

  const token = localStorage.getItem("token");
  const roleFromStorage = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/"); // Redirect to login if no token
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

      // Update UI locally
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

  // Roles that can update interview levels
  const canEditLevels = ["Admin", "Recruiter Lead", "Recruiter"].includes(
    userRole
  );

  return (
    <div className="page-container">
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
                  <option value="L0">L0</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
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
