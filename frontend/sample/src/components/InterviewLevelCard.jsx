// components/InterviewLevelCard.jsx
import React from "react";
import styles from "./InterviewLevelCard.module.css";

const InterviewLevelCard = ({ level, total, passed, pending, rejected }) => (
  <div className={styles.card}>
    <h4>{level}</h4>
    <p>Total: <strong>{total}</strong></p>
    {/* <p className={styles.pass}>Passed: {passed}</p>
    <p className={styles.pending}>Pending: {pending}</p>
    <p className={styles.reject}>Rejected: {rejected}</p> */}
  </div>
);

export default InterviewLevelCard;
