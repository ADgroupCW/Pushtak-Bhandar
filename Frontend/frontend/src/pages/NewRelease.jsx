import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/NewRelease.css';

const NewReleases = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest');
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
    const res = await api.get('/book/new-releases');
    const booksWithRatings = await Promise.all(
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
    setBooks(booksWithRatings);
    setFilteredBooks(booksWithRatings);
  } catch (err) {
    console.error('Failed to fetch new releases:', err);
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
     // Change all className="..." to className="nr-..."
<div className="nr-page">
  <h1>📘 New Releases</h1>

  <div className="nr-filters-bar">
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

  <div className="nr-list">
    {filteredBooks.length === 0 ? (
      <p>No new releases found.</p>
    ) : (
      filteredBooks.map(book => (
        <Link to={`/book/${book.id}`} key={book.id} className="nr-row">
          <img
            src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
            alt={book.title}
          />
          <div className="nr-info">
            <div className="nr-badge-box">
              {isOnSale(book) && <span className="nr-badge nr-sale">ON SALE</span>}
              {isNew(book) && <span className="nr-badge nr-new">NEW</span>}
            </div>
            <h3>{book.title}</h3>
            <p className="nr-author">by {book.author}</p>

            <div className="nr-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={book.averageRating >= star ? 'nr-filled' : 'nr-empty'}>★</span>
              ))}
              <span className="nr-count">({book.reviewCount} reviews)</span>
            </div>

            <p className="nr-desc">{book.description}</p>

            <div className="nr-meta">
              <span className="nr-price">${book.price.toFixed(2)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="nr-original">${book.originalPrice.toFixed(2)}</span>
              )}
              {book.bookAwardNames?.length > 0 && (
                <span className="nr-award">🏅 {book.bookAwardNames.join(', ')}</span>
              )}
            </div>

            {isOnSale(book) && countdowns[book.id] && (
              <p className="nr-countdown">⏳ {countdowns[book.id]}</p>
            )}

            <div className="nr-actions">
              <button onClick={e => handleAddToCart(e, book.id, book.title)}>Add to Cart</button>
              <button onClick={e => handleBookmark(e, book.id, book.title)}>Bookmark</button>
            </div>
          </div>
        </Link>
      ))
    )}
  </div>
</div>

      <Footer />
    </>
  );
};

export default NewReleases;
