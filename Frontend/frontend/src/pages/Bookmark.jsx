import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/Bookmark.css';

const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleAddToCart = async (bookId) => {
  try {
    await api.post('/cart', { bookId, quantity: 1 });
    alert('Added to cart!');
  } catch (err) {
    alert('Failed to add to cart.');
  }
};

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmark/my');
      const rawBookmarks = res.data || [];

      console.log(' Raw bookmarks:', rawBookmarks);

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

      const filtered = enriched.filter(Boolean);
      setBookmarks(filtered);
      console.log(' Enriched bookmarks:', filtered);
    } catch (err) {
      console.error(' Bookmark fetch error:', err);
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
      alert(' Failed to remove bookmark.');
    }
  };

  return (
    <div className="bookmark-page">
      <Navbar />
      <div className="bookmark-container">
        <h2> My Bookmarks</h2>

        {loading ? (
          <p>Loading bookmarks...</p>
        ) : bookmarks.length === 0 ? (
          <p>No bookmarks yet.</p>
        ) : (
          <div className="bookmark-list">
            {bookmarks.map((bm) => {
              const book = bm.book;
              if (!book) return null;

              const imageUrl = book.imageUrl?.startsWith('http')
                ? book.imageUrl
                : `http://localhost:5046${book.imageUrl}`;

              return (
                
                <div className="book-card" key={bm.id}>
                  <Link to={`/book/${book.id}`} key={book.id} className="na-card-link">
                  <div className="book-card-img">
                    <img
                      src={imageUrl}
                      alt={book.title}
                      loading="lazy"
                    />
                    {book.stockCount === 0 && <span className="badge badge-out">OUT OF STOCK</span>}
                    
                  </div>

                  <div className="book-card-info">
                    <h3>{book.title}</h3>
                    <p className="author">by {book.author}</p>
                    

                    

                    <div className="card-actions">
                      <button onClick={() => handleAddToCart(book.id)} className="btn-primary">Add to Cart</button>
                      <button onClick={() => handleRemove(bm.id)} className="btn-outline">Remove</button>
                    </div>
                  </div>
                  </Link>
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
