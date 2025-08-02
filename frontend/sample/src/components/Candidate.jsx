import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CandidateList.css';
import axios from 'axios';

const CandidateList = () => {
  const navigate = useNavigate();
  const { roleTitle, projectId } = useParams();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/candidates/by-project-role/${projectId}/${encodeURIComponent(roleTitle)}`
        );
        setCandidates(res.data || []);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    fetchCandidates();
  }, [roleTitle, projectId]);

  const handleCandidateClick = (candidateId) => {
    navigate(`/candidate-feedback/${candidateId}`);
  };

  const handleLevelChange = async (candidateId, newLevel) => {
    try {
      await axios.put(`http://localhost:5000/api/candidates/${candidateId}/interview-level`, {
        interviewLevel: newLevel,
      });

      // Update UI locally
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, interviewLevel: newLevel } : c
        )
      );
    } catch (err) {
      console.error('Error updating interview level:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <span className="back-arrow" onClick={() => navigate(`/project-review/${projectId}`)}>
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
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div
                onClick={() => handleCandidateClick(candidate._id)}
                style={{ cursor: 'pointer' }}
              >
                <strong>{candidate.name}</strong>
                <p>Current Stage: {candidate.interviewLevel}</p>
              </div>

              <select
                value={candidate.interviewLevel}
                onChange={(e) => handleLevelChange(candidate._id, e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px' }}
              >
                <option value="L0">L0</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateList;
