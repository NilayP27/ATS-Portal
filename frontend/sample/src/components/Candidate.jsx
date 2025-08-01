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

  const handleCandidateClick = (name) => {
    const encodedName = encodeURIComponent(name);
    navigate(`/candidate-feedback/${encodedName}`);
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
          candidates.map((candidate, index) => (
            <div
              key={index}
              className="candidate-card"
              onClick={() => handleCandidateClick(candidate.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className="candidate-info">
                <strong>{candidate.name}</strong>
                <p>Current Stage: {candidate.interviewLevel}</p>
              </div>
              <div className="stage-badge">{candidate.interviewLevel}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateList;
