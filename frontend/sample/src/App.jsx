import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import SignupForm from "./components/SignupForm"; 
import Dashboard from "./components/Dashboard";
import CreateProject from "./components/CreateProject";
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
      </Routes>
    </Router>
  );
}

export default App;
