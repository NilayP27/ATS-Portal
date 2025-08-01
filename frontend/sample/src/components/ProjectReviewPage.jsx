import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import InterviewLevelCard from "./InterviewLevelCard";
import JobCard from "./JobCard";

const ProjectOverview = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [interviewStats, setInterviewStats] = useState({});
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/candidates/${projectId}/overview`);
        setInterviewStats(res.data.interviewStats || {});
        setRoles(res.data.roles || []);
      } catch (err) {
        console.error("Failed to fetch overview:", err);
      }
    };

    fetchOverview();
  }, [projectId]);

  const handleViewCandidates = (jobTitle) => {
    navigate(`/candidates/${encodeURIComponent(jobTitle)}`);
  };

  return (
    <div style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
      <h2>Interview Dashboard</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        {["L0", "L1", "L2"].map((level) => {
          const stats = interviewStats[level] || { passed: 0, pending: 0, rejected: 0 };
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
        {roles.map((role) => (
          <JobCard
            key={role.title}
            title={role.title}
            location={role.location || "N/A"}   
            salary={role.salary || "N/A"}           
            deadline={role.deadline || "N/A"}       
            total={role.total}
            selected={role.selected}
            rejected={role.rejected}
            onView={() => handleViewCandidates(role.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectOverview;
