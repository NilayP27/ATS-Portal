import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./InterviewFeedback.css";

const InterviewFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(`/api/candidates/by-id/${id}`);
      setCandidate(res.data);
      // Add isNew = false to each item fetched from DB
      const withFlags = (res.data.feedback || []).map(fb => ({ ...fb, isNew: false }));
      setFeedbackList(withFlags);
    } catch (err) {
      console.error("Error fetching candidate:", err);
      toast.error("Failed to load candidate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const getStatusClass = (status) => {
    switch (status) {
      case "PASSED":
        return "status passed";
      case "REJECTED":
        return "status rejected";
      case "PENDING":
        return "status pending";
      default:
        return "status pending";
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...feedbackList];
    updated[index][field] = value;
    setFeedbackList(updated);
  };

  const handleSave = async (index) => {
    const item = feedbackList[index];

    if (!item.level || !item.comment || !item.status) {
      toast.warn("Please complete all fields before saving.");
      return;
    }

    try {
      const res = await axios.put(`/api/candidates/${id}/feedback`, item);
      toast.success("Feedback saved!");

      // Replace that index with fresh feedback from server (add isNew: false)
      const savedFb = res.data.feedback.find(fb => fb.level === item.level);
      const updated = [...feedbackList];
      updated[index] = { ...savedFb, isNew: false };
      setFeedbackList(updated);
    } catch (err) {
      console.error("Failed to save feedback:", err);
      toast.error("Error saving feedback.");
    }
  };

  const addFeedback = () => {
    setFeedbackList([
      ...feedbackList,
      { level: "", comment: "", status: "PENDING", isNew: true }
    ]);
  };

  return (
    <div className="feedback-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="candidate-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>←</span>
        <div>
          <h2 className="candidate-name">
            {loading ? "Loading..." : candidate?.name || "Unknown Candidate"}
          </h2>
          <p className="subtitle">Interview feedback and progress</p>
        </div>
      </div>

      <div className="feedback-section">
        <h3>Interview Feedback</h3>

        {feedbackList.map((fb, index) => (
          <div key={index} className="feedback-card editable">
            <div className="feedback-header">
              {!fb.isNew ? (
                <>
                  <span><strong>Interview {fb.level}</strong></span>
                  <span className={getStatusClass(fb.status)}>{fb.status}</span>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Level (e.g., L0)"
                    value={fb.level}
                    onChange={(e) => handleInputChange(index, "level", e.target.value)}
                  />
                  <select
                    value={fb.status}
                    onChange={(e) => handleInputChange(index, "status", e.target.value)}
                  >
                    <option value="PASSED">PASSED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </>
              )}
            </div>

            <div className="feedback-body">
              {!fb.isNew ? (
                fb.comment.trim() || "No feedback provided yet"
              ) : (
                <textarea
                  value={fb.comment}
                  onChange={(e) => handleInputChange(index, "comment", e.target.value)}
                  placeholder="Enter feedback comment"
                  rows={3}
                />
              )}
            </div>

            {fb.isNew && (
              <button onClick={() => handleSave(index)}>💾 Save</button>
            )}
          </div>
        ))}

        <button onClick={addFeedback}>➕ Add Feedback</button>
      </div>
    </div>
  );
};

export default InterviewFeedback;
