import React, { useState } from 'react';
import './LoginForm.css';
import { useLocation, useNavigate } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';

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
        alert('Password has been reset');
        navigate('/');
      } else {
        alert(data.message || 'Invalid or expired code');
      }
    } catch (error) {
      alert('An error occurred. Please try again.',error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <LockResetIcon className="login-icon" />
        </div>
        <h2 className="team-name">DP Team</h2>
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
    </div>
  );
};

export default ResetPassword;
