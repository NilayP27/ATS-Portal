import React from "react";
import { useNavigate } from "react-router-dom";
import InterviewLevelCard from "./InterviewLevelCard";
import JobCard from "./JobCard";

const ProjectOverview = () => {
  const navigate = useNavigate();

  const handleViewCandidates = (jobTitle) => {
    navigate(`/candidates/${encodeURIComponent(jobTitle)}`);
  };

  return (
    <div style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
      <h2>Interview Dashboard</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        <InterviewLevelCard level="L0" total={3} passed={3} pending={0} rejected={0} />
        <InterviewLevelCard level="L1" total={3} passed={2} pending={1} rejected={0} />
        <InterviewLevelCard level="L2" total={2} passed={1} pending={1} rejected={0} />
      </div>

      <h2>Open Roles</h2>
      <div style={{ display: "flex", gap: "2rem" }}>
        <JobCard
          title="Frontend Developer"
          location="New York"
          salary="80000"
          deadline="2024-02-15"
          total={2}
          selected={0}
          rejected={0}
          onView={() => handleViewCandidates("Frontend Developer")}
        />
        <JobCard
          title="Backend Developer"
          location="New York"
          salary="85000"
          deadline="2024-02-20"
          total={1}
          selected={1}
          rejected={0}
          onView={() => handleViewCandidates("Backend Developer")}
        />
      </div>
    </div>
  );
};

export default ProjectOverview;
