import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/NewArrivals.css';

const NewArrivals = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    fetchBooks();
    fetchGenres();
    decodeToken();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      books.forEach(book => {
        if (isInSalePeriod(book)) {
          const end = new Date(book.saleEndDate);
          const now = new Date();
          const diff = end - now;
          if (diff > 0) {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            updated[book.id] = `${d}d ${h}h ${m}m ${s}s`;
          }
        }
      });
      setCountdowns(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [books]);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/book/new-arrivals');
      const enriched = await Promise.all(
        res.data.map(async (book) => {
          try {
            const reviewRes = await api.get(`/reviews/stats/${book.id}/average`);
            return { ...book, averageRating: reviewRes.data.averageRating, reviewCount: reviewRes.data.reviewCount };
          } catch {
            return { ...book, averageRating: 0, reviewCount: 0 };
          }
        })
      );
      setBooks(enriched);
    } catch (err) {
      console.error('Failed to fetch latest books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await api.get('/meta/genres');
      setGenres(res.data);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
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

  const handleAddToCart = async (e, bookId, title) => {
    e.preventDefault(); e.stopPropagation();
    if (!userId) return alert('Please login to add to cart.');
    try {
      await api.post('/cart', { bookId, quantity: 1 });
      alert(`✅ Added "${title}" to cart!`);
    } catch (err) {
      alert('❌ Failed to add to cart.');
    }
  };

  const handleBookmark = async (e, bookId, title) => {
    e.preventDefault(); e.stopPropagation();
    if (!userId) return alert('Please login to bookmark.');
    try {
      await api.post('/bookmark', { bookId });
      alert(`📌 Bookmarked "${title}"!`);
    } catch (err) {
      alert('⚠️ Already bookmarked.');
    }
  };

  const isInSalePeriod = (book) => {
    if (!book.isOnSale) return false;
    const now = new Date();
    return now >= new Date(book.saleStartDate) && now <= new Date(book.saleEndDate);
  };

  const isNew = (book) => {
    const created = new Date(book.createdAt);
    const now = new Date();
    return (now - created) / (1000 * 60 * 60 * 24) < 7;
  };

  const filteredBooks = books
    .filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(book => selectedGenre ? book.genreName === selectedGenre : true);

  return (
    <>
      <Navbar />
      <div className="new-arrivals-container">
        <section className="hero-section">
          <h1>📚 New Arrivals</h1>
          <p>Discover the latest books in our collection!</p>
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

          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value="">Filter by Genre</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>
        </section>

        <section className="books-showcase">
          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => {
              const onSale = isInSalePeriod(book);
              const isNewBook = isNew(book);
              return (
                <Link to={`/book/${book.id}`} key={book.id} className="premium-book-card-link">
                  <div className="premium-book-card">
                    <div className="book-image-container">
                      {onSale && <div className="on-sale-banner">ON SALE</div>}
                      {isNewBook && <div className="new-badge">NEW</div>}
                      <img
                        src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
                        alt={book.title}
                      />
                    </div>
                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p className="author">by {book.author}</p>
                      <p className="description">{book.description}</p>
                      
                      <div className="book-rating">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={book.averageRating >= i ? 'filled-star' : 'empty-star'}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-count">({book.reviewCount ?? 0} reviews)</span>
                      </div>


                      <div className="price">
                        ${book.price.toFixed(2)}
                        {onSale && book.originalPrice && (
                          <span className="original-price">${book.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      {onSale && countdowns[book.id] && (
                        <p className="sale-timer">⏳ {countdowns[book.id]}</p>
                      )}
                      <div className="action-buttons">
                        <button onClick={(e) => handleAddToCart(e, book.id, book.title)} className="add-to-cart-btn">
                          Add to Cart
                        </button>
                        <button onClick={(e) => handleBookmark(e, book.id, book.title)} className="bookmark-btn">
                          Bookmark
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="no-results">
              <h3>No new books found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </section>

        <section className="subscription-banner">
          <div className="banner-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to get notified about new books and offers.</p>
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

export default NewArrivals;
