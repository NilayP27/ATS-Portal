import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginForm from "./components/LoginForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import SignupForm from "./components/SignupForm"; 
import Dashboard from "./components/Dashboard";
import CreateProject from "./components/CreateProject";
import ProjectOverview from "./components/ProjectReviewPage";
import CandidateList from "./components/Candidate";
import InterviewFeedback from "./components/InterviewFeedback"; // ✅ Import added

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/project-review/:projectId" element={<ProjectOverview />} />
        <Route path="/candidates/:jobTitle" element={<CandidateList />} />
        <Route path="/candidate-feedback/:name" element={<InterviewFeedback />} /> {/* ✅ New dynamic route */}
      </Routes>
    </Router>
  );
}

export default App;
