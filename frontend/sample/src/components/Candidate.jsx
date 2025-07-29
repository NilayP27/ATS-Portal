import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Import useNavigate
import './CandidateList.css';

const candidates = [
  {
    name: 'Alice Johnson',
    stage: 'L2',
  },
  {
    name: 'Bob Smith',
    stage: 'L1',
  },
];

const CandidateList = () => {
  const navigate = useNavigate(); // 👈 Initialize navigate function

  return (
    <div className="page-container">
      <div className="header">
        <span className="back-arrow" onClick={() => navigate('/dashboard')}>
          &#8592;
        </span>
        <div>
          <h1 className="title">Frontend Developer</h1>
          <p className="subtitle">Candidate overview and progress</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Candidates</h2>
        {candidates.map((candidate, index) => (
          <div key={index} className="candidate-card">
            <div className="candidate-info">
              <strong>{candidate.name}</strong>
              <p>Current Stage: {candidate.stage}</p>
            </div>
            <div className="stage-badge">{candidate.stage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;
