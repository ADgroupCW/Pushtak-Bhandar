import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import Navbar from '../components/Navbar';
import api from '../api/api';
import Footer from '../components/footer';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [oldPasswordVerified, setOldPasswordVerified] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false
  });

  const passwordCriteria = {
    hasUppercase: /[A-Z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[@$!%*?&]/,
    minLength: /.{8,}/
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setUserData(res.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    fetchProfile();

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    // Apply theme class to body
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getPasswordValidationStatus = (password) => {
    return {
      hasUppercase: passwordCriteria.hasUppercase.test(password),
      hasNumber: passwordCriteria.hasNumber.test(password),
      hasSpecialChar: passwordCriteria.hasSpecialChar.test(password),
      minLength: passwordCriteria.minLength.test(password)
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });

    if (name === 'newPassword') {
      setPasswordValidation(getPasswordValidationStatus(value));
    }
  };





  const verifyOldPassword = async () => {
    if (!passwordForm.oldPassword) {
      setMessage('Please enter your current password');
      setMessageType('error');
      return;
    }

    try {
      const res = await api.post('/auth/verify-password', {
        userId: userData?.id,
        password: passwordForm.oldPassword
      });

      console.log('[DEBUG] Password verified:', res.data);
      setOldPasswordVerified(true);
      setMessage('✅ Password verified. You can now set a new password.');
      setMessageType('success');
    } catch (err) {
      console.error('[DEBUG] Password verification failed:', err.response?.data || err.message);
      setMessage('❌ Incorrect current password.');
      setMessageType('error');
    }
  };


  const handlePasswordChange = async () => {
    const isValid = Object.values(passwordValidation).every(Boolean);
    if (!isValid) {
      setMessage('Password does not meet all the criteria.');
      setMessageType('error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      return;
    }



    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      setMessage('✅ Password changed successfully.');
      setMessageType('success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setOldPasswordVerified(false);
    } catch (err) {
      setMessage('❌ Failed to change password.');
      setMessageType('error');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setOldPasswordVerified(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordValidation({
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      minLength: false
    });
    setMessage('');
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="content-wrapper">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="header-icon">📚</div>
              <h1 className="header-title">Pushtak Bhandar</h1>
              
            </div>
          </div>
        </header>

        <div className="profile-banner">
          <div className="container">
            <div className="profile-banner-content">
              <div className="profile-avatar">
                <span className="profile-avatar-icon">👤</span>
              </div>
              <div className="profile-info-header">
                <h2 className="profile-username">{userData?.userName || 'Loading...'}</h2>
                <span className="profile-tagline">Book Enthusiast</span>
              </div>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="container">
            <div className="card profile-card">
              <section className="card-section">
                <h3 className="section-title">My Profile</h3>
                <div className="profile-info">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Username:</span>
                    <span className="profile-info-value">{userData?.userName}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Email:</span>
                    <span className="profile-info-value">{userData?.email}</span>
                  </div>
                </div>
              </section>

              <section className="card-section">
                <h3 className="section-title">Security Settings</h3>

                <div className="password-form">
                  <h4 className="form-title">Change Your Password</h4>

                  {message && (
                    <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
                      {message}
                    </div>
                  )}

                  {!oldPasswordVerified ? (
                    <div className="password-step">
                      <div className="form-group">
                        <label htmlFor="oldPassword" className="form-label">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="oldPassword"
                          name="oldPassword"
                          placeholder="Enter current password"
                          value={passwordForm.oldPassword}
                          onChange={handleChange}
                          className="form-input"
                        />

                      </div>
                      <div className="form-actions">
                        <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                        <button onClick={verifyOldPassword} className="btn-primary">Verify Password</button>
                      </div>
                    </div>
                  ) : (
                    <div className="password-step">
                      <div className="form-group">
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                        <ul className="password-criteria">
                          <li className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                            At least 8 characters
                          </li>
                          <li className={passwordValidation.hasUppercase ? 'valid' : 'invalid'}>
                            At least one uppercase letter (A–Z)
                          </li>
                          <li className={passwordValidation.hasNumber ? 'valid' : 'invalid'}>
                            At least one number (0–9)
                          </li>
                          <li className={passwordValidation.hasSpecialChar ? 'valid' : 'invalid'}>
                            At least one special character (@ $ ! % * ? &)
                          </li>
                        </ul>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-actions">
                        <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                        <button onClick={handlePasswordChange} className="btn-primary">Update Password</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>

      <Footer />
      </div>
    </div>
  );
};

export default Profile;