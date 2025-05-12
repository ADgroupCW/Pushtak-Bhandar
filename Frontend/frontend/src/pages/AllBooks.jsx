// Import gareko components ra hooks haru
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/AllBooks.css';

//  AllBooks component 
const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedAward, setSelectedAward] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

   // Page load huda data fetch garne
  useEffect(() => {
    fetchBooks();
    fetchFilters();
    decodeToken();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/book');
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
      console.error('Failed to fetch books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [g, p, a] = await Promise.all([
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
      ]);
      setGenres(g.data);
      setPublishers(p.data);
      setAwards(a.data);
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
    if (selectedAward) filtered = filtered.filter(b => b.bookAwardNames?.includes(selectedAward));

    if (sortOption === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredBooks(filtered);
  };

  const goToBookDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  // Frontend ko part
  return (
    <>
      <Navbar />
      <div className="ab-page">
        <h1>📚 Explore All Books</h1>

        <div className="ab-filters-bar">
          <input
            type="text"
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="">Sort By</option>
            <option value="title">Title</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
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

          <button onClick={handleSearchAndFilter}>Search</button>
        </div>

        <div className="ab-list">
          {isLoading ? (
            <p>Loading books...</p>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <div className="ab-row" key={book.id} onClick={() => goToBookDetails(book.id)} style={{ cursor: 'pointer' }}>
                <img
                  src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
                  alt={book.title}
                />
                <div className="ab-info">
                  <h3>{book.title}</h3>
                  <p className="ab-author">by {book.author}</p>
                  <div className="ab-rating">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={book.averageRating >= i ? 'ab-filled-star' : 'ab-empty-star'}>★</span>
                    ))}
                    <span className="ab-rating-count">({book.reviewCount} reviews)</span>
                  </div>
                  <p className="ab-desc">{book.description}</p>
                  <div className="ab-meta">
                    <span className="ab-price">${book.price.toFixed(2)}</span>
                    {book.bookAwardNames?.length > 0 && (
                      <span className="ab-award">🏅 {book.bookAwardNames.join(', ')}</span>
                    )}
                  </div>
                  <div className="ab-actions">
                    <button onClick={(e) => handleAddToCart(e, book.id, book.title)}>Add to Cart</button>
                    <button onClick={(e) => handleBookmark(e, book.id, book.title)}>Bookmark</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No books found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllBooks;
