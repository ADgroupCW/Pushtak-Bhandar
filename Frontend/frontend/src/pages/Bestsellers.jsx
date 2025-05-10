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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
    decodeToken();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/book');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setIsLoading(false);
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

  const handleAddToCart = async (bookId, title) => {
    if (!userId) {
      alert('❌ Please login to add to cart.');
      return;
    }

    try {
      await api.post('/cart', { bookId, quantity: 1 });
      alert(`✅ Added "${title}" to cart!`);
    } catch (err) {
      alert('❌ Failed to add to cart.');
      console.error(err);
    }
  };

  const handleBookmark = async (bookId, title) => {
    if (!userId) {
      alert('❌ Please login to bookmark.');
      return;
    }
    
    try {
      await api.post('/bookmark', { bookId });
      alert(`📌 Bookmarked "${title}"!`);
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

  // Reusable star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.round(rating || 0) ? "star filled" : "star"}>★</span>
        ))}
      </div>
    );
  };

  // Book card component
  const BookCard = ({ book }) => {
    return (
      <div className="premium-book-card" key={book.id}>
        <div className="book-image-container">
          <div className="ribbon">{book.rating >= 4.5 ? "Top Rated" : ""}</div>
          <img
            src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
            alt={book.title}
            loading="lazy"
          />
        </div>
        <div className="book-details">
          <h3>{book.title}</h3>
          <p className="author">by {book.author}</p>
          <div className="rating">
            <StarRating rating={book.rating} />
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
            <div className="action-buttons">
              <button
  onClick={() => handleAddToCart(book.id, book.title)}
  className="add-to-cart-btn"
  aria-label={`Add ${book.title} to cart`}
  style={{ backgroundColor: 'black', color: 'white' }}
>
  <span className="icon"></span>
  <span className="btn-text">Add to Cart</span>
</button>

<button
  onClick={() => handleBookmark(book.id, book.title)}
  className="bookmark-btn"
  aria-label={`Bookmark ${book.title}`}
  style={{ backgroundColor: 'black', color: 'white' }}
>
  <span className="icon"></span>
  <span className="btn-text">Bookmark</span>
</button>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="best-of-best-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Best of the Best</h1>
            <p>Discover our most acclaimed and celebrated literary masterpieces</p>
          </div>
        </section>

        <section className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-options">
            <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
              <option value="">Sort By</option>
              <option value="title">Title</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="category-filters">
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
        </section>

        <section className="books-showcase">
          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading amazing books for you...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => <BookCard key={book.id} book={book} />)
          ) : (
            <div className="no-results">
              <h3>No books found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </section>

        <section className="subscription-banner">
          <div className="banner-content">
            <h2>Join Our Premium Readers Club</h2>
            <p>Get early access to our most celebrated titles and exclusive author interviews.</p>
            <form className="subscribe-form">
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default BestOfTheBest;