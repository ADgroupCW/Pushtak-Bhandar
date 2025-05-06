import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
      const res = await axios.get('/api/announcement');
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
      await axios.delete(`/api/announcement/${id}`);
      fetchAnnouncements();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      title: form.title.value,
      message: form.message.value,
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      isActive: form.isActive.checked,
    };

    try {
      if (formMode === 'add') {
        await axios.post('/api/announcement', data);
      } else {
        await axios.put(`/api/announcement/${selectedAnnouncement.id}`, data);
      }
      fetchAnnouncements();
      setShowForm(false);
    } catch (err) {
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
                  <td>{a.isActive ? '✅' : '❌'}</td>
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
                  <input type="checkbox" name="isActive" defaultChecked={selectedAnnouncement?.isActive} />
                  Show Publicly
                </label>
                <div className="form-buttons">
                  <button type="submit" className="btn primary">✅ Save</button>
                  <button type="button" onClick={() => setShowForm(false)}>❌ Cancel</button>
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
