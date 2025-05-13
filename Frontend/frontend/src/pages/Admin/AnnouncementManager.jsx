import React, { useEffect, useState } from 'react';
import api from '../../api/api'; // ✅ use configured instance
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/AnnouncementManager.css';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcement/admin'); // ✅ admin route
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const openForm = (mode, announcement = null) => {
    setFormMode(mode);
    setSelectedAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcement/${id}`);
      fetchAnnouncements();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;

  const title = form.title.value.trim();
  const message = form.message.value.trim();
  const startDate = form.startDate.value;
  const endDate = form.endDate.value;
  const showPublicly = form.isActive.checked;

  // ✅ Client-side validations
  if (!title || !message || !startDate || !endDate) {
    alert('Please fill in all required fields.');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    alert('End date cannot be earlier than start date.');
    return;
  }

  const data = {
    title,
    message,
    startDate,
    endDate,
    showPublicly,
  };

  try {
    if (formMode === 'add') {
      await api.post('/announcement', data);
    } else {
      await api.put(`/announcement/${selectedAnnouncement.id}`, data);
    }
    fetchAnnouncements();
    setShowForm(false);
  } catch (err) {
    console.error('Form submission error:', err);
    alert('Error submitting form');
  }
};


  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="announcement-manager">
          <h2>📢 Manage Announcements</h2>

          <button className="btn primary" onClick={() => openForm('add')}>
            ➕ Add Announcement
          </button>

          <table className="announcement-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Start</th>
                <th>End</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.message}</td>
                  <td>{a.startDate?.split('T')[0]}</td>
                  <td>{a.endDate?.split('T')[0]}</td>
                  <td>{a.showPublicly ? '✅' : '❌'}</td>
                  <td>
                    <button onClick={() => openForm('edit', a)}>✏️</button>
                    <button className="btn danger" onClick={() => handleDelete(a.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showForm && (
            <div className="modal-overlay">
              <form onSubmit={handleFormSubmit} className="form-container">
                <h3>{formMode === 'add' ? 'Add Announcement' : 'Edit Announcement'}</h3>
                <input name="title" placeholder="Title" defaultValue={selectedAnnouncement?.title} required />
                <textarea name="message" placeholder="Message" defaultValue={selectedAnnouncement?.message} required></textarea>
                <label>Start Date:</label>
                <input name="startDate" type="date" defaultValue={selectedAnnouncement?.startDate?.split('T')[0]} required />
                <label>End Date:</label>
                <input name="endDate" type="date" defaultValue={selectedAnnouncement?.endDate?.split('T')[0]} required />
                <label>
                  <input type="checkbox" name="isActive" defaultChecked={selectedAnnouncement?.showPublicly} />
                  Show Publicly
                </label>
                <div className="form-buttons">
                  <button type="submit" className="btn primary">Save</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManager;
