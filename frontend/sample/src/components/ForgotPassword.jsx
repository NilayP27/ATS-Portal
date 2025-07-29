import React, { useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        toast.success('📩 Reset code sent to your email');
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1000);
      } else {
        toast.error(data.message || '❌ Failed to send reset code');
      }
    } catch (e) {
      toast.error('⚠️ An error occurred. Please try again.');
      console.error('Forgot Password Error:', e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <img src="/image.png" alt="Company Logo" className="company-logo" />
        </div>
        <h2 className="team-name">VDart</h2>
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

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ForgotPassword;
