import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth-related components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

// Dashboard & Project management
import Dashboard from "./components/Dashboard";
import CreateProject from "./components/CreateProject";
import ProjectOverview from "./components/ProjectReviewPage";
import EditProject from "./components/EditProject";

// Candidate-related components
import CandidateList from "./components/Candidate"; // Shows candidates for a role
import InterviewFeedback from "./components/InterviewFeedback"; // Candidate's feedback form/view

// Profile
import ProfileEdit from "./components/ProfileEdit";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Project Management Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/project-review/:projectId" element={<ProjectOverview />} />
        <Route path="/edit-project/:projectId" element={<EditProject />} />

        {/* Candidate Routes */}
        <Route path="/candidates/:projectId/:roleTitle" element={<CandidateList />} />
        <Route path="/candidate-feedback/:id" element={<InterviewFeedback />} />

        {/* Profile Route */}
        <Route path="/profile/edit" element={<ProfileEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
