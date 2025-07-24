import React, { useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Reset code sent to your email');
        navigate('/reset-password', { state: { email } });
      } else {
        alert(data.message || 'Failed to send reset code');
      }
    } catch (e) {
      alert('An error occurred. Please try again.',e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <MailOutlineIcon className="login-icon" />
        </div>
        <h2 className="team-name">DP Team</h2>
        <p className="welcome-text">Reset your password</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="sign-in-button">
            Send Reset Code
          </button>
        </form>
        <p className="forgot-password" onClick={() => navigate('/')}>
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
