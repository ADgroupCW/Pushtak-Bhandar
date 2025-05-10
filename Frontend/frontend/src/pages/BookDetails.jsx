import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    // Trigger fade-in animation after component mounts and data is loaded
    if (!loading && book) {
      setFadeIn(true);
    }
  }, [loading, book]);

  // Display temporary message for user actions
  const showMessage = (text, type) => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
  };

  const fetchBook = async () => {
    try {
      const res = await api.get(`/book/${id}`);
      setBook(res.data);
      // Update page title with book name
      document.title = `${res.data.title} | Book Details`;
    } catch (err) {
      showMessage('Book not found.', 'error');
      navigate('/bestsellers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      showMessage('Please log in first.', 'error');
      return;
    }
    
    try {
      await api.post('/cart', { bookId: book.id, quantity });
      showMessage('Added to cart successfully!', 'success');
    } catch (err) {
      showMessage('Failed to add to cart.', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      showMessage('Please log in first.', 'error');
      return;
    }
    
    try {
      await api.post('/bookmark', { bookId: book.id });
      showMessage('Book bookmarked successfully!', 'success');
    } catch (err) {
      showMessage('Already bookmarked or operation failed.', 'error');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="book-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading book details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!book) return null;

  const imageUrl = book.imageUrl?.startsWith('http')
    ? book.imageUrl
    : `http://localhost:5046${book.imageUrl}`;

  return (
    <div className="book-page">
      <Navbar />
      
      {actionMessage.text && (
        <div className={`action-message ${actionMessage.type}`}>
          {actionMessage.type === 'success' ? '✓ ' : '✕ '}
          {actionMessage.text}
        </div>
      )}
      
      <div className={`book-details-container ${fadeIn ? 'fade-in' : ''}`}>
        <div className="book-image-container">
          <img 
            src={imageUrl} 
            alt={book.title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/book-placeholder.png';
            }}
          />
          {book.bestSeller && <div className="bestseller-badge">Bestseller</div>}
        </div>
        
        <div className="book-info">
          <div className="book-header">
            <h1>{book.title}</h1>
            <p className="author">by <span>{book.author}</span></p>
            
            <div className="book-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(book.rating || 0) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {book.rating?.toFixed(1) || '0.0'} ({book.reviews || 0} reviews)
              </span>
            </div>
          </div>
          
          <div className="book-price">
            <span className="price">${book.price?.toFixed(2)}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="original-price">${book.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <div className="book-description">
            <h2>Description</h2>
            <p>{book.description}</p>
          </div>
          
          <div className="book-details">
            <div className="detail-row">
              <span>Category:</span>
              <span>{book.category}</span>
            </div>
            <div className="detail-row">
              <span>Format:</span>
              <span>{book.format}</span>
            </div>
            <div className="detail-row">
              <span>Language:</span>
              <span>{book.language}</span>
            </div>
            <div className="detail-row">
              <span>Publisher:</span>
              <span>{book.publisher}</span>
            </div>
            {book.publicationDate && (
              <div className="detail-row">
                <span>Publication Date:</span>
                <span>{new Date(book.publicationDate).toLocaleDateString()}</span>
              </div>
            )}
            {book.isbn && (
              <div className="detail-row">
                <span>ISBN:</span>
                <span>{book.isbn}</span>
              </div>
            )}
          </div>
          
          {book.awards && book.awards.length > 0 && (
            <div className="awards">
              <h2>Awards</h2>
              <ul>
                {book.awards.map((award, i) => <li key={i}>{award}</li>)}
              </ul>
            </div>
          )}
          
          <div className="book-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={quantity} 
                onChange={handleQuantityChange}
              />
              <button 
                onClick={() => quantity < 10 && setQuantity(quantity + 1)}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
            
            <div className="action-buttons">
              <button 
                className="add-to-cart" 
                onClick={handleAddToCart}
                disabled={!isLoggedIn}
              >
                Add to Cart
              </button>
              <button 
                className="bookmark" 
                onClick={handleBookmark}
                disabled={!isLoggedIn}
              >
                {book.isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
            
            {!isLoggedIn && (
              <p className="login-prompt">
                Please <a href="/login">log in</a> to purchase or bookmark this book.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookDetails;