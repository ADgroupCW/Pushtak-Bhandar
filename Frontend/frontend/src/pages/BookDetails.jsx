import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/BookDetails.css';

const BookDetails = () => {
  const { id } = useParams(); // from route like /book/:id
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await api.get(`/book/${id}`);
      setBook(res.data);
    } catch (err) {
      alert('❌ Book not found.');
      navigate('/bestsellers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) return alert('Please log in first.');
    try {
      await api.post('/cart', { bookId: book.id, quantity: 1 });
      alert('🛒 Added to cart!');
    } catch (err) {
      alert('Failed to add to cart.');
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) return alert('Please log in first.');
    try {
      await api.post('/bookmark', { bookId: book.id });
      alert('📌 Bookmarked!');
    } catch (err) {
      alert('Already bookmarked or failed.');
    }
  };

  if (loading) return <div className="book-page"><Navbar /><p>Loading...</p></div>;
  if (!book) return null;

  const imageUrl = book.imageUrl?.startsWith('http')
    ? book.imageUrl
    : `http://localhost:5046${book.imageUrl}`;

  return (
    <div className="book-page">
      <Navbar />
      <div className="book-details-container">
        <div className="book-image">
          <img src={imageUrl} alt={book.title} />
        </div>
        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          <p className="description">{book.description}</p>
          <p><strong>Category:</strong> {book.category}</p>
          <p><strong>Format:</strong> {book.format}</p>
          <p><strong>Language:</strong> {book.language}</p>
          <p><strong>Publisher:</strong> {book.publisher}</p>
          <p><strong>Price:</strong> ${book.price?.toFixed(2)}</p>

          <div className="book-rating">
            <span>⭐ {book.rating?.toFixed(1) || '0.0'} ({book.reviews || 0} reviews)</span>
          </div>

          {book.awards && book.awards.length > 0 && (
            <div className="awards">
              <h4>Awards:</h4>
              <ul>
                {book.awards.map((award, i) => <li key={i}>{award}</li>)}
              </ul>
            </div>
          )}

          <div className="book-actions">
            <button onClick={handleAddToCart}>🛒 Add to Cart</button>
            <button onClick={handleBookmark}>📌 Bookmark</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookDetails;
