import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/BookDetails.css';

const Popup = ({ type, text, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className={`popup-box ${type}`}>
        <p>{text}</p>
        <button className="popup-close" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [countdown, setCountdown] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchBook();
    fetchReviewStats();
    fetchAllReviews();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await api.get(`/book/${id}`);
      setBook(res.data);
      document.title = `${res.data.title} | Book Details`;
      startCountdown(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load book.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await api.get(`/reviews/stats/${id}/average`);
      setAverage(res.data.averageRating);
      setReviewCount(res.data.reviewCount);
    } catch {
      setAverage(0);
      setReviewCount(0);
    }
  };

  const fetchAllReviews = async () => {
    try {
      const res = await api.get(`/reviews/book/${id}`);
      setReviews(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setReviews([]);
    }
  };

  const startCountdown = (book) => {
    if (!book?.isOnSale) return;
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(book.saleEndDate);
      const diff = end - now;
      if (diff <= 0) {
        setCountdown('Sale ended');
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
  };

  const handleAddToCart = async () => {
  if (!isLoggedIn) {
    alert('Please log in first.');
    return;
  }

  if (book.stockCount === 0) {
    alert('This book is currently out of stock.');
    return;
  }

  try {
    await api.post('/cart', { bookId: book.id, quantity });
    alert('Added to cart!');
  } catch {
    alert('Failed to add to cart.');
  }
};



  const handleBookmark = async () => {
  if (!isLoggedIn) {
    alert('Please log in first.');
    return;
  }
  try {
    await api.post('/bookmark', { bookId: book.id });
    alert('Bookmarked!');
  } catch (err) {
    alert(err?.response?.data || 'Bookmark failed.');
  }
};
;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.round(rating) ? 'filled-star' : 'empty-star'}>★</span>
    ));
  };

  if (loading) return <div>Loading...</div>;

  if (!book) return <div>Book not found.</div>;

  const imageUrl = book.imageUrl?.startsWith('http')
    ? book.imageUrl
    : `http://localhost:5046${book.imageUrl}`;

  return (
    <div className="book-page">
      <Navbar />

      <div className="book-details-container">
        <div className="book-image-container">
          <img src={imageUrl} alt={book.title} />
        </div>

        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">by <strong>{book.author}</strong></p>

          <div className="rating-row">
            <div className="stars">{renderStars(average)}</div>
            <span>({reviewCount} reviews)</span>
          </div>

          <div className="price-block">
            {book.isOnSale && book.price < book.originalPrice ? (
              <>
                <span className="price">${book.price.toFixed(2)}</span>
                <span className="original-price">${book.originalPrice.toFixed(2)}</span>
                {countdown && <div className="sale-timer">⏳ {countdown}</div>}
              </>
            ) : (
              <span className="price">${book.originalPrice.toFixed(2)}</span>
            )}
          </div>


          <p className="description">{book.description}</p>

          <div className="details-box two-columns">
            <div className="left-col">
              <p><strong>Publisher:</strong> {book.publisherName}</p>
              <p><strong>Genre:</strong> {book.genreName}</p>
              <p><strong>Language:</strong> {book.language}</p>
              <p><strong>Publication Date:</strong> {new Date(book.publicationDate).toLocaleDateString()}</p>
              <p>
                <strong>Stock:</strong>{' '}
                {book.stockCount > 5 ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>In Stock</span>
                ) : book.stockCount > 0 ? (
                  <span style={{ color: 'orange', fontWeight: 'bold' }}>
                    Only {book.stockCount} left!
                  </span>
                ) : (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</span>
                )}
              </p>
            </div>

            <div className="right-col">
              <p><strong>Awards:</strong></p>
              {book.bookAwardNames && book.bookAwardNames.length > 0 ? (
                <ul className="award-list">
                  {book.bookAwardNames.map((award, idx) => (
                    <li key={idx}>🏆 {award}</li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
            </div>
          </div>



          <div className="actions">
            <button className="add" onClick={handleAddToCart}>Add to Cart</button>
            <button className="bookmark" onClick={handleBookmark}>Bookmark</button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-container">
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="review-header">
                <strong>{r.userEmail}</strong>
                <div className="stars">{renderStars(r.rating)}</div>
                <span className="date">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <p className="comment">"{r.comment}"</p>
            </div>
          ))
        )}
      </div>
      {message && (
  <Popup
    type={message.type}
    text={message.text}
    onClose={() => setMessage(null)}
  />
)}


      <Footer />
    </div>
  );
};

export default BookDetails;
