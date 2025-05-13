import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/Bestseller.css';

const BestOfTheBest = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('rating');
  const [genres, setGenres] = useState([]);
  const [formats, setFormats] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedAward, setSelectedAward] = useState('');
  const [userId, setUserId] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    fetchBooks();
    fetchFilters();
    decodeToken();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      books.forEach(book => {
        if (isOnSale(book)) {
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

  const isNew = (book) => {
    const created = new Date(book.createdAt);
    const now = new Date();
    return (now - created) / (1000 * 60 * 60 * 24) < 7;
  };

  const isOnSale = (book) => {
    if (!book.isOnSale) return false;
    const now = new Date();
    return now >= new Date(book.saleStartDate) && now <= new Date(book.saleEndDate);
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/book/best-sellers');
      const enriched = await Promise.all(
        res.data.map(async (book) => {
          try {
            const ratingRes = await api.get(`/reviews/stats/${book.id}/average`);
            return {
              ...book,
              averageRating: ratingRes.data.averageRating,
              reviewCount: ratingRes.data.reviewCount
            };
          } catch {
            return { ...book, averageRating: 0, reviewCount: 0 };
          }
        })
      );
      setBooks(enriched);
      setFilteredBooks(enriched);
    } catch (err) {
      console.error('Failed to fetch bestsellers:', err);
    }
  };

  const fetchFilters = async () => {
    try {
      const [g, p, a, f] = await Promise.all([
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
        api.get('/meta/formats'),
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
    if (selectedFormat) filtered = filtered.filter(b => b.bookFormatNames.includes(selectedFormat));
    if (selectedPublisher) filtered = filtered.filter(b => b.publisherName === selectedPublisher);
    if (selectedAward) filtered = filtered.filter(b => b.bookAwardNames.includes(selectedAward));

    if (sortOption === 'rating') {
      filtered.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
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
      <div className="botb-page">
        <h1>🏆 Best of the Best</h1>

        <div className="botb-filters-bar">
          <input
            type="text"
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="rating">Sort: Top Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
            <option value="">Genre</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}>
            <option value="">Format</option>
            {formats.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>

          <select value={selectedPublisher} onChange={e => setSelectedPublisher(e.target.value)}>
            <option value="">Publisher</option>
            {publishers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>

          <select value={selectedAward} onChange={e => setSelectedAward(e.target.value)}>
            <option value="">Award</option>
            {awards.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>

          <button onClick={handleSearchAndFilter}>Search</button>
        </div>

        <section className="na-books">
  {filteredBooks.length === 0 ? (
    <div className="na-empty">
      <h3>No bestsellers found</h3>
      <p>Try adjusting your search or filters.</p>
    </div>
  ) : (
    filteredBooks.map(book => {
      const onSale = isOnSale(book);
      const isNewBook = isNew(book);

      return (
        <Link to={`/book/${book.id}`} key={book.id} className="na-card-link">
          <div className="na-card">
            <div className="na-img-box">
              {book.stockCount === 0 && <div className="na-badge na-out">OUT OF STOCK</div>}
              {onSale && <div className="na-badge na-sale">ON SALE</div>}
              {isNewBook && <div className="na-badge na-new">NEW</div>}
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
                  <span key={i} className={book.averageRating >= i ? 'na-filled-star' : 'na-empty-star'}>★</span>
                ))}
                <span className="na-rating-count">({book.reviewCount} reviews)</span>
              </div>

              <div className="na-price-section">
                {onSale && book.price < book.originalPrice ? (
                  <>
                    <span className="na-sale-price">${book.price.toFixed(2)}</span>
                    <span className="na-original-price">${book.originalPrice.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="na-regular-price">${book.originalPrice.toFixed(2)}</span>
                )}
              </div>


              {onSale && countdowns[book.id] && (
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
                <button
                  onClick={(e) => handleAddToCart(e, book.id, book.title)}
                  disabled={book.stockCount === 0}
                >
                  Add to Cart
                </button>
                <button
                  onClick={(e) => handleBookmark(e, book.id, book.title)}
                  disabled={book.stockCount === 0}
                >
                  Bookmark
                </button>
              </div>

            </div>
          </div>
        </Link>
      );
    })
  )}
</section>

      </div>
      <Footer />
    </>
  );
};

export default BestOfTheBest;
