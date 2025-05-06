import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="admin-content">
          <h2>Welcome, Admin</h2>
          <div className="dashboard-cards">
            <div className="card">📚 Total Books: 120</div>
            <div className="card">👥 Total Users: 35</div>
            <div className="card">🔥 Bestsellers: 10</div>
            <div className="card">💰 Ongoing Deals: 4</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
