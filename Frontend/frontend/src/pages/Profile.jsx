import React, { useState } from 'react';
import '../styles/Profile.css';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [oldPasswordVerified, setOldPasswordVerified] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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

  const verifyOldPassword = () => {
    if (passwordForm.oldPassword) {
      setOldPasswordVerified(true);
      setMessage('Password verified. You can now set a new password.');
      setMessageType('success');
    } else {
      setMessage('Please enter your current password');
      setMessageType('error');
    }
  };

  const handlePasswordChange = () => {
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

    setMessage('Password changed successfully.');
    setMessageType('success');
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setOldPasswordVerified(false);
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
      <div>
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
              <h2 className="profile-username">bookworm123</h2>
              <p className="profile-tagline">Book Enthusiast</p>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="container">
            <div className="card">
              <section className="card-section">
                <h3 className="section-title">My Profile</h3>
                <div className="profile-info">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Username:</span>
                    <span className="profile-info-value">bookworm123</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Email:</span>
                    <span className="profile-info-value">reader@bookhaven.com</span>
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
                    <div>
                      <div className="form-group">
                        <label htmlFor="oldPassword" className="form-label">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="oldPassword"
                          name="oldPassword"
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
                    <div>
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
                        {/* Password criteria feedback */}
                        <ul style={{ marginTop: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
                          <li style={{ color: passwordValidation.minLength ? 'green' : 'red' }}>
                            • At least 8 characters
                          </li>
                          <li style={{ color: passwordValidation.hasUppercase ? 'green' : 'red' }}>
                            • At least one uppercase letter (A–Z)
                          </li>
                          <li style={{ color: passwordValidation.hasNumber ? 'green' : 'red' }}>
                            • At least one number (0–9)
                          </li>
                          <li style={{ color: passwordValidation.hasSpecialChar ? 'green' : 'red' }}>
                            • At least one special character (@ $ ! % * ? &)
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
      </div>
    </div>
  );
};

export default Profile;
