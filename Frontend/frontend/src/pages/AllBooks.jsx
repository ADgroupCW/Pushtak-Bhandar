import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/AllBooks.css';

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
  const [countdowns, setCountdowns] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchFilters();
    decodeToken();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      books.forEach(book => {
        if (
          book.isOnSale &&
          new Date() >= new Date(book.saleStartDate) &&
          new Date() <= new Date(book.saleEndDate)
        ) {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

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
    setCurrentPage(1);
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <>
      <Navbar />
      <div className="ab-page">
        <h1>Explore All Books</h1>

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

        <div className="na-books">
          {isLoading ? (
            <div className="na-loading">
              <div className="loader"></div>
              <p>Loading books...</p>
            </div>
          ) : currentBooks.length > 0 ? (
            currentBooks.map(book => {
              const onSale = book.isOnSale &&
                new Date() >= new Date(book.saleStartDate) &&
                new Date() <= new Date(book.saleEndDate);
              const isNewBook = (new Date() - new Date(book.createdAt)) / (1000 * 60 * 60 * 24) < 7;

              return (
                <Link to={`/book/${book.id}`} key={book.id} className="na-card-link">
                  <div key={book.id} className="na-card">
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
                          <span key={i} className={book.averageRating >= i ? 'na-filled-star' : 'na-empty-star'}>
                            ★
                          </span>
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
          ) : (
            <p>No books found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="ab-pagination">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`ab-page-button ${currentPage === i + 1 ? 'ab-active-page' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllBooks;
