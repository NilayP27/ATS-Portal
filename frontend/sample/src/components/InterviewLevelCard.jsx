// components/InterviewLevelCard.jsx
import React from "react";
import styles from "./InterviewLevelCard.module.css";

const getLevelDescription = (level) => {
  const levelDescriptions = {
    'L1': 'Technical Assessment/First Round',
    'L2': 'Technical Interview/Second Round',
    'L3': 'System Design/Architecture Round',
    'L4': 'Managerial/Leadership Interview',
    'L5': 'Cultural Fit/HR Interview',
    'L6': 'Final Interview/Director Level',
    'Selected': 'Selected'
  };
  return levelDescriptions[level] || level;
};

const InterviewLevelCard = ({ level, total, passed, pending, rejected }) => (
  <div className={styles.card}>
    <h4>{level}</h4>
    <p className={styles.levelDescription}>{getLevelDescription(level)}</p>
    <p>Total: <strong>{total}</strong></p>
    {/* <p className={styles.pass}>Passed: {passed}</p>
    <p className={styles.pending}>Pending: {pending}</p>
    <p className={styles.reject}>Rejected: {rejected}</p> */}
  </div>
);

export default InterviewLevelCard;
