import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/user');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await axios.delete(`/api/user/${userId}`);
      fetchUsers();
    } catch (err) {
      alert('Error deactivating user.');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="user-management">
          <h2>👥 Manage Users</h2>

          <div className="user-search-bar">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.memberId || `MEM-${user.id}`}</td>
                  <td>{user.firstName || user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.isActive ? '✅' : '❌'}</td>
                  <td>
                    {user.isActive && (
                      <button
                        className="btn danger"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
