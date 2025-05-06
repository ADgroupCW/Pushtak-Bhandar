import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/ReviewModeration.css';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews'); // Adjust to your API route
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`/api/reviews/${id}`);
      fetchReviews();
    } catch {
      alert('Error deleting review');
    }
  };

  const filtered = reviews.filter(
    (r) =>
      r.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="review-moderation">
          <h2>📝 Review Moderation</h2>

          <input
            type="text"
            placeholder="Search by book or user email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="review-search"
          />

          <table className="review-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id}>
                  <td>{review.book?.title || 'N/A'}</td>
                  <td>{review.user?.email || 'Unknown'}</td>
                  <td>{'⭐'.repeat(review.rating)}</td>
                  <td>{review.comment}</td>
                  <td>{review.createdAt?.split('T')[0]}</td>
                  <td>
                    <button className="btn danger" onClick={() => handleDelete(review.id)}>🗑️</button>
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

export default ReviewModeration;
