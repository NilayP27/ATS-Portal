import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./InterviewFeedback.css";

const feedbackData = [
  { level: "L0", comment: "Excellent technical knowledge", status: "PASSED" },
  { level: "L1", comment: "Great team fit", status: "PASSED" },
  { level: "L2", comment: "Perfect candidate", status: "PASSED" },
];

const InterviewFeedback = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  return (
    <div className="feedback-container">
      <div className="candidate-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>←</span>
        <div>
          <h2 className="candidate-name">{decodeURIComponent(name)}</h2>
          <p className="subtitle">Interview feedback and progress</p>
        </div>
      </div>

      <div className="feedback-section">
        <h3>Interview Feedback</h3>
        {feedbackData.map((feedback, index) => (
          <div key={index} className="feedback-card">
            <div className="feedback-header">
              <strong>Interview {feedback.level}</strong>
              <span className="status">{feedback.status}</span>
            </div>
            <div className="feedback-body">
              {feedback.comment}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewFeedback;
