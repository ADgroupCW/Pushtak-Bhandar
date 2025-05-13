import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/Deals.css';

const Deals = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest');

  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [formats, setFormats] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedAward, setSelectedAward] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchFilters();
    decodeToken();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      books.forEach(book => {
        const end = new Date(book.saleEndDate);
        const now = new Date();
        const diff = end - now;
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / (1000 * 60)) % 60);
          const s = Math.floor((diff / 1000) % 60);
          updated[book.id] = `${d}d ${h}h ${m}m ${s}s`;
        } else {
          updated[book.id] = 'Sale ended';
        }
      });
      setCountdowns(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [books]);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/book');
      const now = new Date();
      const onSaleBooks = await Promise.all(
        res.data
          .filter(book => book.isOnSale && now >= new Date(book.saleStartDate) && now <= new Date(book.saleEndDate))
          .map(async book => {
            try {
              const reviewRes = await api.get(`/reviews/stats/${book.id}/average`);
              return {
                ...book,
                averageRating: reviewRes.data.averageRating,
                reviewCount: reviewRes.data.reviewCount
              };
            } catch {
              return { ...book, averageRating: 0, reviewCount: 0 };
            }
          })
      );
      setBooks(onSaleBooks);
      setFilteredBooks(onSaleBooks);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    }
  };

  const fetchFilters = async () => {
    try {
      const [g, p, a, f] = await Promise.all([
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
        api.get('/meta/formats')
      ]);
      setGenres(g.data);
      setPublishers(p.data);
      setAwards(a.data);
      setFormats(f.data);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
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

  const handleSearchAndFilter = () => {
    let filtered = [...books];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
      );
    }

    if (selectedGenre) filtered = filtered.filter(b => b.genreName === selectedGenre);
    if (selectedPublisher) filtered = filtered.filter(b => b.publisherName === selectedPublisher);
    if (selectedAward) filtered = filtered.filter(b => b.bookAwardNames.includes(selectedAward));
    if (selectedFormat) filtered = filtered.filter(b => b.bookFormatNames.includes(selectedFormat));

    if (sortOption === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredBooks(filtered);
  };

  const handleAddToCart = async (e, bookId, title) => {
    e.preventDefault();
    if (!userId) return alert('Please login to add to cart.');
    try {
      await api.post('/cart', { bookId, quantity: 1 });
      alert(`✅ Added "${title}" to cart!`);
    } catch {
      alert('❌ Failed to add to cart.');
    }
  };

  const handleBookmark = async (e, bookId, title) => {
    e.preventDefault();
    if (!userId) return alert('Please login to bookmark.');
    try {
      await api.post('/bookmark', { bookId });
      alert(`📌 Bookmarked "${title}"!`);
    } catch {
      alert('⚠️ Already bookmarked.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="deal-page">
        <h1>🔥 Book Deals</h1>

        <div className="deal-filters">
          <input
            type="text"
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
          <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
            <option value="">Genre</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>
          <select value={selectedPublisher} onChange={e => setSelectedPublisher(e.target.value)}>
            <option value="">Publisher</option>
            {publishers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <select value={selectedAward} onChange={e => setSelectedAward(e.target.value)}>
            <option value="">Award</option>
            {awards.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}>
            <option value="">Format</option>
            {formats.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
          <button onClick={handleSearchAndFilter}>Search</button>
        </div>

        <div className="na-books">
        
        {filteredBooks.length === 0 ? (
          <p>No deals found.</p>
        ) : (
          filteredBooks.map(book => {
            const isNew = (new Date() - new Date(book.createdAt)) / (1000 * 60 * 60 * 24) < 7;

            return (
              <Link to={`/book/${book.id}`} key={book.id} className="na-card-link">
              <div key={book.id} className="na-card">
                <div className="na-img-box">
                  {book.stockCount === 0 && (
                    <div className="na-out-overlay">
                      <div className="na-out-content">
                        <span className="na-lock">🔒</span>
                        <p>Currently Unavailable</p>
                      </div>
                    </div>
                  )}
                  <div className="na-badge na-sale">ON SALE</div>
                  {isNew && <div className="na-badge na-new">NEW</div>}
                  <img
                    src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
                    alt={book.title}
                  />
                </div>

                <div className="na-info">
                  <h3>{book.title}</h3>
                  <p className="na-author">by {book.author}</p>
                  <p className="na-desc">{book.description}</p>

                  <div className="na-rating">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={book.averageRating >= i ? 'na-filled-star' : 'na-empty-star'}>
                        ★
                      </span>
                    ))}
                    <span className="na-rating-count">({book.reviewCount} reviews)</span>
                  </div>

                  <div className="na-price">
                    ${book.price.toFixed(2)}
                    {book.originalPrice && (
                      <span className="na-original-price">${book.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {countdowns[book.id] && (
                    <p className="na-timer">⏳ {countdowns[book.id]}</p>
                  )}

                  {book.bookAwardNames?.length > 0 && (
                    <div className="na-awards-container">
                      {book.bookAwardNames.map((award, index) => (
                        <span key={index} className="na-award-card">🏅 {award}</span>
                      ))}
                    </div>
                  )}

                  <div className="na-actions">
                    <button onClick={(e) => handleAddToCart(e, book.id, book.title)} disabled={book.stockCount === 0}>
                      Add to Cart
                    </button>
                    <button onClick={(e) => handleBookmark(e, book.id, book.title)} disabled={book.stockCount === 0}>
                      Bookmark
                    </button>
                  </div>
                </div>
              </div>
              </Link>
            );
          })
        )}
      </div>

      </div>
      <Footer />
    </>
  );
};

export default Deals;
