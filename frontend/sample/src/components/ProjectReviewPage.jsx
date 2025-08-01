import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import InterviewLevelCard from "./InterviewLevelCard";
import JobCard from "./JobCard";

const ProjectOverview = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [interviewStats, setInterviewStats] = useState({});
  const [roleStats, setRoleStats] = useState([]);
  const [projectRoles, setProjectRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch candidate stats (interview summary)
        const candidateRes = await axios.get(
          `http://localhost:5000/api/candidates/${projectId}/overview`
        );
        setInterviewStats(candidateRes.data.interviewStats || {});
        setRoleStats(candidateRes.data.roles || []);

        // 2. Fetch project info including roles
        const projectRes = await axios.get(
          `http://localhost:5000/api/projects/${projectId}`
        );
        setProjectRoles(projectRes.data.roles || []);
      } catch (err) {
        console.error("Failed to fetch project overview:", err);
      }
    };

    fetchData();
  }, [projectId]);

  const handleViewCandidates = (jobTitle) => {
    navigate(`/candidates/${encodeURIComponent(jobTitle)}`);
  };

  return (
    <div style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
      <h2>Interview Dashboard</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        {["L0", "L1", "L2"].map((level) => {
          const stats = interviewStats[level] || {
            passed: 0,
            pending: 0,
            rejected: 0,
          };
          const total = stats.passed + stats.pending + stats.rejected;

          return (
            <InterviewLevelCard
              key={level}
              level={level}
              total={total}
              passed={stats.passed}
              pending={stats.pending}
              rejected={stats.rejected}
            />
          );
        })}
      </div>

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
    </div>
  );
};

export default ProjectOverview;
