// Import required React tools and components
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/Bookmark.css';

// Page load huda fetch garxa
const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmark/my');
      const rawBookmarks = res.data || [];

      console.log('📌 Raw bookmarks:', rawBookmarks);

      // Get full book details for each bookmark
      const enriched = await Promise.all(
        rawBookmarks.map(async (bm) => {
          try {
            const bookRes = await api.get(`/book/${bm.bookId}`);
            return { ...bm, book: bookRes.data };
          } catch (err) {
            console.warn(`⚠️ Skipping bookmark ID ${bm.id} — book not found.`);
            return null;
          }
        })
      );

      // Remove any null entries (book not found)
      const filtered = enriched.filter(Boolean);
      setBookmarks(filtered);
      console.log('✅ Enriched bookmarks:', filtered);
    } catch (err) {
      console.error('❌ Bookmark fetch error:', err);
      alert('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookmarkId) => {
    if (!window.confirm('Remove this bookmark?')) return;
    try {
      await api.delete(`/bookmark/${bookmarkId}`);
      fetchBookmarks();
    } catch (err) {
      alert('❌ Failed to remove bookmark.');
    }
  };

  // Frontend Starts Here
  return (
    <div className="bookmark-page">
      <Navbar />
      <div className="bookmark-container">
        <h2>📌 My Bookmarks</h2>

{/* Loading state */}
        {loading ? (
          <p>Loading bookmarks...</p>
        ) : bookmarks.length === 0 ? (
          <p>No bookmarks yet.</p>
        ) : (
          <div className="bookmark-list">
            {bookmarks.map((bm) => {
              const book = bm.book;
              if (!book) return null;

              // Book image path handling
              const imageUrl = book.imageUrl?.startsWith('http')
                ? book.imageUrl
                : `http://localhost:5046${book.imageUrl}`;

              return (
                <div className="bookmark-card" key={bm.id}>
                  <img src={imageUrl} alt={book.title} className="bookmark-image" />
                  <div className="bookmark-details">
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                    <p>${book.price?.toFixed(2) || '0.00'}</p>
                    <button onClick={() => handleRemove(bm.id)} className="remove-btn">❌ Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Bookmark;
