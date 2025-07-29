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
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<SignupForm />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-project" element={<CreateProject />}/>
        <Route path="/project-review/:projectId" element={<ProjectOverview />} />
        <Route path="/" element={<ProjectOverview />} />
        <Route path="/candidates/:jobTitle" element={<CandidateList />} />
      </Routes>
    </Router>
  );
}

export default App;
