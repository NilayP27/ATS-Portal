import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import InterviewLevelCard from "./InterviewLevelCard";
import JobCard from "./JobCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProjectOverview = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [interviewStats, setInterviewStats] = useState({});
  const [currentLevelStats, setCurrentLevelStats] = useState({});
  const [roleStats, setRoleStats] = useState([]);
  const [projectRoles, setProjectRoles] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [projectInfo, setProjectInfo] = useState(null);

  const token = localStorage.getItem("token");
  const roleFromStorage = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      setUserRole(roleFromStorage || "User");
    }
  }, [token, navigate, roleFromStorage]);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const candidateRes = await axios.get(
        `http://localhost:5000/api/candidates/${projectId}/overview`,
        { headers }
      );

      setInterviewStats(candidateRes.data.interviewStats || {});
      setCurrentLevelStats(candidateRes.data.currentLevelStats || {});
      setRoleStats(candidateRes.data.roles || []);

      const projectRes = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers }
      );
      setProjectRoles(projectRes.data.roles || []);
      setProjectInfo(projectRes.data || {});
    } catch (err) {
      console.error("Failed to fetch project overview:", err);
      if (err.response?.status === 403) {
        toast.error("❌ Access denied: You do not have permission to view this page");
        navigate("/dashboard");
      } else {
        toast.error("⚠️ Failed to load project overview");
      }
    }
  }, [projectId, token, navigate]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [fetchData, token]);

  const handleViewCandidates = (roleTitle) => {
    navigate(`/candidates/${projectId}/${encodeURIComponent(roleTitle)}`);
  };

  return (
    <div style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
      <ToastContainer position="top-center" autoClose={2000} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, color: "#111827" }}>
          Project Name: {projectInfo?.projectName || "Project Overview"}
        </h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {(userRole === "Admin" || userRole === "Project Initiator") && (
            <button
              onClick={() => navigate(`/edit-project/${projectId}`)}
              style={{
                background: "linear-gradient(to right, #28a745, #20c997)",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              Edit Project
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "linear-gradient(to right, #4d4dff, #706cff)",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {projectInfo && (
        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#111827" }}>
              Project Information
            </h3>
            <p><strong>Client:</strong> {projectInfo.clientName || "N/A"}</p>
            <p><strong>Location:</strong> {projectInfo.location || "N/A"}</p>
            <p>
              <strong>Requisition Date:</strong>{" "}
              {projectInfo.startDate
                ? new Date(projectInfo.startDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p><strong>Status:</strong> {projectInfo.status || "N/A"}</p>
            <p><strong>Lead:</strong> {projectInfo.lead || "N/A"}</p>
          </div>

          <div style={{ flex: 1, minWidth: "280px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#111827" }}>
              Interview Statistics
            </h3>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              {["L0", "L1", "L2"].map((level) => {
                const feedbackStats = interviewStats[level] || {
                  passed: 0,
                  pending: 0,
                  rejected: 0,
                };
                const currentTotal = currentLevelStats[level] || 0;

                return (
                  <InterviewLevelCard
                    key={level}
                    level={level}
                    total={currentTotal}
                    passed={feedbackStats.passed}
                    pending={feedbackStats.pending}
                    rejected={feedbackStats.rejected}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {(userRole === "Admin" ||
        userRole === "Recruiter Lead" ||
        userRole === "Recruiter" ||
        userRole === "Project Initiator") && (
        <>
          <h2>Open Roles</h2>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {projectRoles.map((role, idx) => {
              const stats = roleStats.find((r) => r.title === role.title) || {
                total: 0,
                selected: 0,
                rejected: 0,
              };

              return (
                <JobCard
                  key={`${role.title}-${idx}`}
                  title={role.title}
                  location={role.location || "N/A"}
                  salary={`${role.currency || ""} ${role.salary || "N/A"}`}
                  deadline={role.deadline || "N/A"}
                  total={stats.total}
                  selected={stats.selected}
                  rejected={stats.rejected}
                  onView={() => handleViewCandidates(role.title)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectOverview;
