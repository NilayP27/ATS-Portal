import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./InterviewFeedback.css";

const InterviewFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token") || "";
  const role = localStorage.getItem("role") || "";

  const canEditFeedback = ["Admin", "Recruiter Lead", "Recruiter"].includes(role);

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/candidates/by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCandidate(res.data);

      const withFlags = (res.data.feedback || []).map((fb) => ({
        ...fb,
        isNew: false,
        isEditing: false,
      }));
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
      const res = await axios.put(
        `http://localhost:5000/api/candidates/${id}/feedback`,
        item,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Feedback saved!");
      const savedFb = res.data.feedback.find((fb) => fb.level === item.level);

      const updated = [...feedbackList];
      updated[index] = { ...savedFb, isNew: false, isEditing: false };
      setFeedbackList(updated);
    } catch (err) {
      console.error("Failed to save feedback:", err);
      toast.error("Error saving feedback.");
    }
  };

  const addFeedback = () => {
    const usedLevels = feedbackList.map((f) => f.level).filter(Boolean);
    const possibleLevels = ["L0", "L1", "L2"];

    const nextAvailable = possibleLevels.find(
      (lvl) => !usedLevels.includes(lvl)
    );

    if (!nextAvailable) {
      toast.warn("All feedback levels (L0, L1, L2) are already used.");
      return;
    }

    const previousIndex = possibleLevels.indexOf(nextAvailable) - 1;
    if (previousIndex >= 0) {
      const previousLevel = possibleLevels[previousIndex];
      const previousFeedback = feedbackList.find(
        (f) => f.level === previousLevel
      );

      if (previousFeedback && previousFeedback.status === "REJECTED") {
        toast.warn(
          `Cannot add ${nextAvailable} feedback. Candidate was rejected in ${previousLevel}.`
        );
        return;
      }
    }

    setFeedbackList([
      ...feedbackList,
      {
        level: nextAvailable,
        comment: "",
        status: "PENDING",
        isNew: true,
        isEditing: true,
      },
    ]);
  };

  const toggleEdit = (index) => {
    const updated = [...feedbackList];
    updated[index].isEditing = true;
    setFeedbackList(updated);
  };

  return (
    <div className="feedback-container">
      <ToastContainer position="top-center" autoClose={1500} />

      <div className="candidate-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>
          ←
        </span>
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
              <span>
                <strong>Interview {fb.level}</strong>
              </span>

              {!fb.isNew && !fb.isEditing && (
                <span className={getStatusClass(fb.status)}>{fb.status}</span>
              )}

              {canEditFeedback && !fb.isNew && !fb.isEditing && (
                <button onClick={() => toggleEdit(index)}>✏ Edit</button>
              )}
            </div>

            <div className="feedback-body">
              {fb.isNew || fb.isEditing ? (
                <>
                  <select
                    value={fb.status}
                    onChange={(e) =>
                      handleInputChange(index, "status", e.target.value)
                    }
                    disabled={!canEditFeedback}
                  >
                    <option value="PASSED">PASSED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="PENDING">PENDING</option>
                  </select>

                  <textarea
                    value={fb.comment}
                    onChange={(e) =>
                      handleInputChange(index, "comment", e.target.value)
                    }
                    placeholder="Enter feedback comment"
                    rows={3}
                    disabled={!canEditFeedback}
                  />

                  {canEditFeedback && (
                    <button onClick={() => handleSave(index)}>💾 Save</button>
                  )}
                </>
              ) : (
                fb.comment?.trim() || "No feedback provided yet"
              )}
            </div>
          </div>
        ))}

        {canEditFeedback && (
          <button onClick={addFeedback}>➕ Add Feedback</button>
        )}
      </div>
    </div>
  );
};

export default InterviewFeedback;
