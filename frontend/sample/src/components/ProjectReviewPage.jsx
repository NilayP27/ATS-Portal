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
  const [openRoles, setOpenRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get candidate stats (for interview dashboard & role-wise summary)
        const candidateRes = await axios.get(
          `http://localhost:5000/api/candidates/${projectId}/overview`
        );
        setInterviewStats(candidateRes.data.interviewStats || []);
        setRoleStats(candidateRes.data.roles || []);

        // Get open roles
        const rolesRes = await axios.get(
          `http://localhost:5000/api/open-roles/${projectId}`
        );
        setOpenRoles(rolesRes.data || []);
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
      <div style={{ display: "flex", gap: "2rem" }}>
        {openRoles.map((role) => {
          const stats = roleStats.find((r) => r.title === role.title) || {
            total: 0,
            selected: 0,
            rejected: 0,
          };

          return (
            <JobCard
              key={role._id}
              title={role.title}
              location={role.location || "N/A"}
              salary={role.salary || "N/A"}
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
