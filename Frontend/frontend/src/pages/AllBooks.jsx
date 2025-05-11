import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/AllBooks.css';

const AllBooks = () => {
  const [books, setBooks] = useState([]);
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
        api.get('/meta/awards')
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

  const handleAddToCart = async (bookId, title) => {
    if (!userId) return alert('Please login to add to cart.');
    try {
      await api.post('/cart', { bookId, quantity: 1 });
      alert(`✅ Added "${title}" to cart!`);
    } catch (err) {
      alert('❌ Failed to add to cart.');
    }
  };

  const handleBookmark = async (bookId, title) => {
    if (!userId) return alert('Please login to bookmark.');
    try {
      await api.post('/bookmark', { bookId });
      alert(`📌 Bookmarked "${title}"!`);
    } catch (err) {
      alert('⚠️ Already bookmarked.');
    }
  };

  const goToBookDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const filteredBooks = books
    .filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(book => selectedGenre ? book.genreName === selectedGenre : true)
    .filter(book => selectedPublisher ? book.publisherName === selectedPublisher : true)
    .filter(book => selectedAward ? book.bookAwardNames?.includes(selectedAward) : true)
    .sort((a, b) => {
      if (sortOption === 'title') return a.title.localeCompare(b.title);
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <>
      <Navbar />
      <div className="all-books-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Explore All Books</h1>
            <p>Browse our complete collection with filters to help you find the perfect book.</p>
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
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">Sort By</option>
              <option value="title">Title</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="dropdowns">
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              <option value="">Filter by Genre</option>
              {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>

            <select value={selectedPublisher} onChange={(e) => setSelectedPublisher(e.target.value)}>
              <option value="">Filter by Publisher</option>
              {publishers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>

            <select value={selectedAward} onChange={(e) => setSelectedAward(e.target.value)}>
              <option value="">Filter by Award</option>
              {awards.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </section>

        <section className="books-showcase">
          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <div className="premium-book-card" key={book.id}>
                <div className="book-image-container" onClick={() => goToBookDetails(book.id)} style={{ cursor: 'pointer' }}>
                  <img
                    src={book.imageUrl?.startsWith('http') ? book.imageUrl : `http://localhost:5046${book.imageUrl}`}
                    alt={book.title}
                  />
                </div>
                <div className="book-details">
                  <h3 onClick={() => goToBookDetails(book.id)} style={{ cursor: 'pointer' }}>{book.title}</h3>
                  <p className="author">by {book.author}</p>
                  <p className="description">{book.description}</p>

                  <div className="book-rating">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={book.averageRating >= i ? 'filled-star' : 'empty-star'}>★</span>
                    ))}
                    <span className="rating-count">({book.reviewCount} reviews)</span>
                  </div>

                  <div className="price">${book.price.toFixed(2)}</div>
                  <div className="action-buttons">
                    <button onClick={() => handleAddToCart(book.id, book.title)} className="add-to-cart-btn">Add to Cart</button>
                    <button onClick={() => handleBookmark(book.id, book.title)} className="bookmark-btn">Bookmark</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No books found</h3>
              <p>Try adjusting your filters or search.</p>
            </div>
          )}
        </section>

        <section className="subscription-banner">
          <div className="banner-content">
            <h2>Subscribe for Updates</h2>
            <p>Join our readers club and stay up to date with new releases and offers.</p>
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

export default AllBooks;
