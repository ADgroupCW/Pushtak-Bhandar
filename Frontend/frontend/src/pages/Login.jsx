import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import api from '../api/api'

export default function Login() {
  const [form, setForm] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Basic validation
    if (!form.emailOrUsername.trim() || !form.password) {
      setError('All fields are required');
      return;
    }
  
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
  
    setError(''); // Clear previous errors
  
    try {
      const response = await api.post('/Auth/login', {
        EmailOrUsername: form.emailOrUsername,
        password: form.password,
      });
    
      // ⚠️ Case: Email not verified
      if (!response.data.success && response.data.code === 'EMAIL_NOT_VERIFIED') {
        // Resend OTP
        await api.post('/auth/resend-otp', null, {
          params: { email: response.data.email }
        });
      
        // Then redirect to OTP screen
        navigate('/verifyotp', {
          state: { email: response.data.email }
        });
        return;
      }
    
      // ✅ Successful login
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setSuccess(true);
      
      const role = response.data.role?.toLowerCase();
      console.log('The role is: ', role)

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(msg);
    }
    
  };
  
  

  if (success) {
    return (
      <div className="login-success-wrapper">
        <div className="login-success-box">
          <BookOpen size={48} />
          <h2 className="login-success-title">Login Successful!</h2>
          <p className="login-success-message">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="book-decoration-top">
        <div className="book red" />
        <div className="book blue" />
        <div className="book green" />
        <div className="book yellow" />
        <div className="book purple" />
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <BookOpen size={40} />
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Login to your Pushtak Bhandar account</p>
        </div>

        <div className="login-body">
          <h3 className="login-heading">Sign In</h3>

          {error && <div className="login-error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email or Username */}
            <div className="form-group">
              <label htmlFor="emailOrUsername">Email or Username</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="text"
                  id="emailOrUsername"
                  name="emailOrUsername"
                  placeholder="you@example.com or yourusername"
                  value={form.emailOrUsername}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="form-note">
                Minimum 8 characters required
                <br />
                <span
                  className="login-forgot-password"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </span>
              </p>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <div className="login-bottom">
            <p>Don't have an account?</p>
            <button className="login-register-button"
            onClick={() => navigate('/register')}
            >Register</button>
          </div>

          <p className="login-policy">
            By logging in, you agree to Pushtak Bhandar's{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <div className="login-footer-decor">
        <div className="line" />
        <BookOpen size={24} className="footer-icon" />
        <div className="line" />
      </div>
      <p className="login-quote">
        "Reading is essential for those who seek to rise above the ordinary."
      </p>
    </div>
  );
}
