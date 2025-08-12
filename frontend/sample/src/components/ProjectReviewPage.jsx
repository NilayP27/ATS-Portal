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

  // Get token & role from localStorage
  const token = localStorage.getItem("token");
  const roleFromStorage = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/"); // Redirect if not logged in
    } else {
      setUserRole(roleFromStorage || "User");
    }
  }, [token, navigate, roleFromStorage]);

  // ✅ useCallback ensures stable reference
  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch candidate stats
      const candidateRes = await axios.get(
        `http://localhost:5000/api/candidates/${projectId}/overview`,
        { headers }
      );

      setInterviewStats(candidateRes.data.interviewStats || {});
      setCurrentLevelStats(candidateRes.data.currentLevelStats || {});
      setRoleStats(candidateRes.data.roles || []);

      // 2. Fetch project info including roles
      const projectRes = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers }
      );
      setProjectRoles(projectRes.data.roles || []);
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

      {/* Interview Dashboard Title with Back Arrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: "#1f2937",
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard")}
      >
        <span style={{ marginRight: "0.75rem", fontSize: "1.5rem" }}>
          &#8592;
        </span>
        <h2 style={{ margin: 0 }}>Interview Dashboard</h2>
      </div>

      {/* Level-wise summary cards */}
      <div style={{ display: "flex", gap: "1rem" }}>
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

      {/* Open roles - Show only for allowed roles */}
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
