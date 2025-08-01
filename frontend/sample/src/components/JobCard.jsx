import React from "react";
import styles from "./JobCard.module.css";
import { Eye } from "lucide-react";

const JobCard = ({
  title,
  location,
  salary,
  deadline,
  total,
  selected,
  rejected,
  onView,
}) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <h3>{title}</h3>
      <Eye
        className={styles.eyeIcon}
        onClick={onView}
        style={{ cursor: "pointer" }}
        title="View Candidates"
      />
    </div>

    <div className={styles.meta}>
      <p>📍 {location}</p>
      <p>💲 {salary}</p>
      <p>📅 Deadline: {deadline}</p>
    </div>

    <div className={styles.summary}>
      <h4>Candidate Summary</h4>
      <div className={styles.counts}>
        <span>Total: <strong>{total}</strong></span>
        <span className={styles.pass}>Selected: <strong>{selected}</strong></span>
        <span className={styles.reject}>Rejected: <strong>{rejected}</strong></span>
      </div>
    </div>
  </div>
);

export default JobCard;