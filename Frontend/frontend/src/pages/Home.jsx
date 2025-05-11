import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/Home.css';
import api from '../api/api';
// Import images
import bg from '../assets/bg.jpg';
import awardImg from '../assets/award.jpg';
import bestsellerImg from '../assets/bestseller.jpg';
import dealImg from '../assets/deal.jpg';
import book1 from '../assets/book1.jpg';
import book2 from '../assets/book2.jpg';
import book3 from '../assets/book3.jpg';
// Add more book images as needed
import authorImg from '../assets/author.jpg'; // Add this image to your assets
import { useNavigate } from 'react-router-dom';




// At the top of your Home.jsx (after imports)
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `http://localhost:5046${imagePath}`;
};



const Home = () => {
  // Featured books data
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bookOfMonth, setBookOfMonth] = useState(null);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  const navigate = useNavigate();
  const featuredRef = useRef(null);
  const testimonials = [
    { name: "Priya Sharma", text: "Pushtak Bhandar has the best collection of books I've ever seen. Their customer service is exceptional!" },
    { name: "Rahul Verma", text: "I love the exclusive discounts and the variety of books available. Will definitely shop again!" },
    { name: "Ananya Patel", text: "The delivery was quick and the books were in perfect condition. Highly recommend!" }
  ];

useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcement/public');
      setAnnouncements(res.data || []);
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  };

  fetchAnnouncements();
}, []);


  useEffect(() => {
  if (announcements.length > 1) {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }
}, [announcements]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // ✅ FETCH BOOKS from /books/homepage using api instance
  useEffect(() => {
    const loadBooks = async () => {
  try {
    const response = await api.get('/Book/homepage');
    const randomBooksRaw = response.data.randomBooks;
    const bookOfMonthRaw = response.data.bookOfTheMonth;

    // Fetch full book details + rating for each featured book
    const randomBooks = await Promise.all(
      randomBooksRaw.map(async (book) => {
        const [bookDetails, ratingRes] = await Promise.all([
          api.get(`/Book/${book.id}`),
          api.get(`/reviews/stats/${book.id}/average`)
        ]);
        return {
          ...bookDetails.data,
          rating: ratingRes.data.averageRating || 0
        };
      })
    );

    // Fetch book of the month details + rating
    const [bookMonthDetails, ratingMonthRes] = await Promise.all([
      api.get(`/Book/${bookOfMonthRaw.id}`),
      api.get(`/reviews/stats/${bookOfMonthRaw.id}/average`)
    ]);
    const bookOfMonth = {
      ...bookMonthDetails.data,
      rating: ratingMonthRes.data.averageRating || 0
    };

    // Set states
    setFeaturedBooks(randomBooks);
    setBookOfMonth(bookOfMonth);

    // ✅ Console log full enriched data
    console.log("Featured Books (with rating & image):", randomBooks);
    console.log("Book of the Month (full):", bookOfMonth);

  } catch (error) {
    console.error("Error loading books or ratings:", error);
  }
};



    loadBooks();
  }, []);

  const handleAddToCart = async (bookId) => {
  try {
    await api.post("/cart", {
      bookId,
      quantity: 1,
    });
    alert("Book added to cart!");
  } catch (error) {
    console.error("Add to cart failed:", error);
    alert("Failed to add to cart.");
  }
};

const handleBookmark = async (bookId) => {
  try {
    await api.post("/bookmark", {
      bookId,
    });
    alert("Book bookmarked!");
  } catch (error) {
    console.error("Bookmark failed:", error);
    alert("Failed to bookmark.");
  }
};



  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/newsletter/subscribe", { email });
    alert(res.data); // shows success message
  } catch (error) {
    console.error("Subscription error:", error);
    alert("Something went wrong. Please try again.");
  }

  setEmail('');
};


  const RatingStars = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>★</span>
      );
    }
    return <div className="rating">{stars}</div>;
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section with Animation */}
      <div className="hero-section" style={{ backgroundImage: `url(${bg})` }}>
        <div className="hero-content fade-in">
          <h1>
            Welcome to <span className="brand-name">Pushtak Bhandar</span>
          </h1>
          <p className="hero-tagline">Your Gateway to Literary Excellence</p>
          <p className="hero-description">
            Discover a world of literary treasures at Pushtak Bhandar.
            Browse our extensive collection, find books by your favorite author or genre, 
            and enjoy exclusive member discounts.
          </p>
          <div className="hero-buttons">
            <button
              className="explore-btn pulse"
              onClick={() => featuredRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Collection
            </button>

            <button
              className="membership-btn"
              onClick={() => navigate('/login')}
            >
              Join Membership
            </button>

          </div>
        </div>
      </div>

      {/* Quick Search Section */}
      

      {/* Categories with Hover Effects */}
      <section className="categories-section" ref={featuredRef}>
        <h2 className="section-title">Explore Categories</h2>
        <div className="categories-grid">
          <div className="category" style={{ backgroundImage: `url(${awardImg})` }}>
            <div className="category-overlay">
              <h2>Award Winners</h2>
              <p>Discover critically acclaimed literary masterpieces</p>
              <button onClick={() => navigate('/awardwinners')} >Shop Now</button>
            </div>
          </div>
          <div className="category" style={{ backgroundImage: `url(${bestsellerImg})` }}>
            <div className="category-overlay">
              <h2>Bestsellers</h2>
              <p>Explore our most popular books this season</p>
              <button onClick={() => navigate('/bestsellers')} >Shop Now</button>
            </div>
          </div>
          <div className="category" style={{ backgroundImage: `url(${dealImg})` }}>
            <div className="category-overlay">
              <h2>Special Deals</h2>
              <p>Limited time offers you don't want to miss</p>
              <button onClick={() => navigate('/deals')} >Shop Now</button>
            </div>
          </div>
          <div className="category new-releases">
            <div className="category-overlay">
              <h2>New Releases</h2>
              <p>Fresh off the press and ready for your bookshelf</p>
              <button onClick={() => navigate('/newrelease')} >Shop Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books with Enhanced UI */}
      <section className="featured-section">
        <h2 className="section-title">Featured Books</h2>
        <div className="book-list">
          {featuredBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-image-container">
                <img src={getFullImageUrl(book.imageUrl)} alt={book.title} />

                <div className="book-overlay">
                  <button className="quick-view" onClick={() => navigate(`/book/${book.id}`)}>
                    Quick View
                  </button>

                </div>
              </div>
              <div className="book-details">
                <h4>{book.title}</h4>
                <p className="book-author">by {book.author}</p>
                <RatingStars rating={book.rating} />
                <div className="book-price-container">
                  <p className="book-price">${book.price.toFixed(2)}</p>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <button className="view-all-btn" onClick={() => navigate('/allbooks')}>
            View All Books
          </button>

        </div>
      </section>

      {/* Author of the Month */}
      {/* Book of the Month */}
      {bookOfMonth && (
        <section className="author-section" onClick={() => navigate(`/book/${bookOfMonth.id}`)} style={{ cursor: 'pointer' }}>
          <div className="author-content">
            <div className="author-image">
              <img src={getFullImageUrl(bookOfMonth.imageUrl)} alt={bookOfMonth.title} />

            </div>
            <div className="author-details">
              <h2>Book of the Month</h2>
              <h3>{bookOfMonth.title}</h3>
              <p><strong>by {bookOfMonth.author}</strong></p>
              <p>
                This book has been highly rated by our readers and selected as the standout literary piece this month.
              </p>
              
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Carousel */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Readers Say</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            <p className="testimonial-author">— {testimonials[currentTestimonial].name}</p>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Promo Banner */}
      {announcements.length > 0 && (
        <div className="promo-banner">
          <div className="promo-content">
            <h2>{announcements[currentAnnouncement].title}</h2>
            <p>{announcements[currentAnnouncement].message}</p>
            <p className="highlight">
              {new Date(announcements[currentAnnouncement].startDate).toLocaleDateString()} -{' '}
              {new Date(announcements[currentAnnouncement].endDate).toLocaleDateString()}
            </p>
          </div>

          {announcements.length > 1 && (
            <div className="announcement-dots">
              {announcements.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentAnnouncement ? 'active' : ''}`}
                  onClick={() => setCurrentAnnouncement(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}


      {/* Newsletter Subscription */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for new releases, author interviews, and exclusive offers.</p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;