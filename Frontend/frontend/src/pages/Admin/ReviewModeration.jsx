import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/ReviewModeration.css';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch {
      alert('Error deleting review');
    }
  };

  const openPopup = async (bookId) => {
    try {
      const res = await api.get(`/book/${bookId}`);
      setSelectedBook(res.data);
      setShowPopup(true);
    } catch (err) {
      alert('Failed to load book details.');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedBook(null);
  };

  const filtered = reviews.filter(
    (r) =>
      r.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="review-moderation">
          <h2> Review Moderation</h2>

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
                  <td>{review.bookTitle || 'N/A'}</td>
                  <td>{review.userEmail || 'Unknown'}</td>
                  <td>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < review.rating ? 'filled-star' : 'empty-star'}
                      >
                        ★
                      </span>
                    ))}
                  </td>
                  <td>{review.comment}</td>
                  <td>{review.createdAt?.split('T')[0]}</td>
                  <td>
                    <button
                      className="btn view"
                      onClick={() => openPopup(review.bookId)}
                    >
                       View
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showPopup && selectedBook && (
            <div
              className="book-popup"
              onClick={() => {
                setShowPopup(false);
                setSelectedBook(null);
              }}
            >
              <div
                className="book-popup-content"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
              >
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowPopup(false);
                    setSelectedBook(null);
                  }}
                >
                  ✖
                </button>

                <img
                  src={
                    selectedBook.imageUrl?.startsWith('http')
                      ? selectedBook.imageUrl
                      : `http://localhost:5046${selectedBook.imageUrl}`
                  }
                  alt={selectedBook.title}
                />

                <div className="popup-details">
                  <h3>{selectedBook.title}</h3>
                  <p><strong>Author:</strong> {selectedBook.author}</p>
                  <p><strong>Genre:</strong> {selectedBook.genreName}</p>
                  <p><strong>Price:</strong> ${selectedBook.price?.toFixed(2)}</p>
                  <p className="book-description">{selectedBook.description}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReviewModeration;
