import React, { useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Login successful!');
setTimeout(() => {
  navigate('/dashboard');
}, 1000); // Delay navigation by 1.5 seconds

      } else {
        toast.error(`❌ ${data.message}`);
      }
    } catch (error) {
      toast.error('⚠️ Server error. Please try again later.');
      console.error('Login error:', error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <img src="/image.png" alt="Company Logo" className="company-logo" />
        </div>

        <h2 className="team-name">VDart</h2>
        <p className="welcome-text">Welcome back to your workspace</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="sign-in-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
          Forgot your password?
        </p>

        {/* ➕ Optional Sign Up link */}
        {/* <p className="signup-link" onClick={() => navigate('/signup')}>
          Don't have an account? <strong>Sign Up</strong>
        </p> */}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default LoginForm;
