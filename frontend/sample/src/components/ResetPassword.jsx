import React, { useState } from 'react';
import './LoginForm.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(' Password has been reset!');
        setTimeout(() => navigate('/'), 1000);
      } else {
        toast.error(data.message || '❌ Invalid or expired reset code');
      }
    } catch (error) {
      toast.error(' An error occurred. Please try again.');
      console.error('Reset password error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <img src="/image.png" alt="Company Logo" className="company-logo" />
        </div>
        <h2 className="team-name">VDart</h2>
        <p className="welcome-text">Enter reset code & new password</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Enter reset code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="sign-in-button">
            Reset Password
          </button>
        </form>

        <p className="forgot-password" onClick={() => navigate('/')}>
          Back to Login
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ResetPassword;
