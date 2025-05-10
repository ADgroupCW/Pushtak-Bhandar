import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/Bestseller.css';

const BestOfTheBest = () => {
  const [books, setBooks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchBooks();
    decodeToken();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/book');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const decodeToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      setUserId(id);
    } catch (err) {
      console.error('Invalid token', err);
    }
  };

  const handleAddToCart = async (bookId) => {
    if (!userId) {
      alert('❌ Please login to add to cart.');
      return;
    }

    try {
      await api.post('/cart', { bookId, quantity: 1 });
      alert('✅ Added to cart!');
    } catch (err) {
      alert('❌ Failed to add to cart.');
      console.error(err);
    }
  };

  const handleBookmark = async (bookId) => {
    try {
      await api.post('/bookmark', { bookId });
      alert('📌 Bookmarked!');
    } catch (err) {
      if (err.response?.status === 400) {
        alert('⚠️ Book is already bookmarked.');
      } else {
        alert('❌ Failed to bookmark.');
      }
      console.error(err);
    }
  };



  const filteredBooks = books
    .filter(book =>
      activeFilter === 'all' || book.category?.toLowerCase() === activeFilter
    )
    .filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'title') return a.title.localeCompare(b.title);
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <>
      <Navbar />
      <div className="best-of-best-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Best of the Best</h1>
            <p>Discover our most acclaimed and celebrated literary masterpieces</p>
          </div>
        </div>

        <div className="filters-section">
          <input
            type="text"
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
            <option value="">Sort By</option>
            <option value="title">Title</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>

          {['all', 'fiction', 'thriller', 'classic', 'fantasy'].map(cat => (
            <button
              key={cat}
              className={activeFilter === cat ? 'active' : ''}
              onClick={() => setActiveFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="books-showcase">
          {filteredBooks.map(book => (
            <div className="premium-book-card" key={book.id}>
              <div className="book-image-container">
                <img
                  src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
                  alt={book.title}
                />
              </div>
              <div className="book-details">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <div className="rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(book.rating || 0) ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                  {book.reviews && (
                    <span className="review-count">({book.reviews.toLocaleString()} reviews)</span>
                  )}
                </div>
                <p className="description">{book.description}</p>

                {book.awards && book.awards.length > 0 && (
                  <div className="awards">
                    <h4>Awards:</h4>
                    <ul>
                      {book.awards.map((award, index) => (
                        <li key={index}>{award}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="book-actions">
                  <span className="price">${book.price.toFixed(2)}</span>
                  <button onClick={() => handleAddToCart(book.id)} className="add-to-cart-btn">🛒 Add to Cart</button>
                  <button onClick={() => handleBookmark(book.id)} className="bookmark-btn">📌 Bookmark</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="subscription-banner">
          <div className="banner-content">
            <h2>Join Our Premium Readers Club</h2>
            <p>Get early access to our most celebrated titles and exclusive author interviews.</p>
            <form className="subscribe-form">
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BestOfTheBest;
