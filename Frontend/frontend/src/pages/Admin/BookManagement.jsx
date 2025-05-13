import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/BookManagement.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [formats, setFormats] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterSale, setFilterSale] = useState('');
  const [filterAwards, setFilterAwards] = useState([]);
  const [filterFormats, setFilterFormats] = useState([]);
  const [sortOption, setSortOption] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchDropdowns();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/book');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const fetchDropdowns = async () => {
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
      console.error('Dropdown fetch failed:', err);
    }
  };

  const toggleFilterItem = (setter, value, list) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/book/${id}`);
      fetchBooks();
    } catch (err) {
      alert('Error deleting book');
    }
  };

  const filteredBooks = books
    .filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterGenre === '' || book.genreName === filterGenre) &&
      (filterPublisher === '' || book.publisherName === filterPublisher) &&
      (filterLanguage === '' || book.language === filterLanguage) &&
      (filterSale === '' ||
        (filterSale === 'onSale' && book.isOnSale) ||
        (filterSale === 'notOnSale' && !book.isOnSale)) &&
      (filterAwards.length === 0 || filterAwards.some(award => book.bookAwardNames?.includes(award))) &&
      (filterFormats.length === 0 || filterFormats.some(format => book.bookFormatNames?.includes(format)))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'priceLowHigh': return a.price - b.price;
        case 'priceHighLow': return b.price - a.price;
        case 'newest': return new Date(b.publicationDate) - new Date(a.publicationDate);
        case 'oldest': return new Date(a.publicationDate) - new Date(b.publicationDate);
        default: return 0;
      }
    });

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="book-management">
          <h2>📚 Manage Books</h2>

          <div className="book-management-topbar">
            <input
              type="text"
              placeholder="Search by title or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn" onClick={() => navigate(`/admin/addbook/`)}>
              ➕ Add Book
            </button>
          </div>

          <div className="filter-bar">
            <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
              <option value="">All Genres</option>
              {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>

            <select value={filterPublisher} onChange={(e) => setFilterPublisher(e.target.value)}>
              <option value="">All Publishers</option>
              {publishers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>

            <select value={filterSale} onChange={(e) => setFilterSale(e.target.value)}>
              <option value="">All</option>
              <option value="onSale">On Sale</option>
              <option value="notOnSale">Not On Sale</option>
            </select>

            <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)}>
              <option value="">All Languages</option>
              {[...new Set(books.map(b => b.language))].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">Sort By</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="tag-filters">
            <div>
              <label><strong>Awards:</strong></label>
              {awards.map(a => (
                <span key={a.id} className={`tag ${filterAwards.includes(a.name) ? 'selected' : ''}`}
                  onClick={() => toggleFilterItem(setFilterAwards, a.name, filterAwards)}>
                  {a.name}
                </span>
              ))}
            </div>
            <div>
              <label><strong>Formats:</strong></label>
              {formats.map(f => (
                <span key={f.id} className={`tag ${filterFormats.includes(f.name) ? 'selected' : ''}`}
                  onClick={() => toggleFilterItem(setFilterFormats, f.name, filterFormats)}>
                  {f.name}
                </span>
              ))}
            </div>
          </div>

          <table className="book-management-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Author</th>
                <th>Price</th>
                <th>Language</th>
                <th>Stock</th>
                <th>Sale</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <img
                      src={
                        book.imageUrl?.startsWith('http')
                          ? book.imageUrl
                          : `http://localhost:5046${book.imageUrl}`
                      }
                      alt={book.title}
                      width="40"
                      height="60"
                    />
                  </td>
                  <td>
                    <strong>{book.title}</strong><br />
                    <small>{book.author}</small>
                  </td>
                  <td>
                    {book.isOnSale ? (
                      <>
                        <span className="strikethrough">${book.originalPrice}</span>{' '}
                        <strong className="sale">${book.price}</strong>
                      </>
                    ) : (
                      <>${book.originalPrice}</>
                    )}
                  </td>
                  <td>{book.language}</td>
                  <td>{book.stockCount}</td>
                  <td>{book.isOnSale ? 'Sale' : '-'}</td>
                  <td>
                    <button className="btn" onClick={() => navigate(`/admin/editbook/${book.id}`)}>✏️</button>
                    <button className="btn danger" onClick={() => handleDelete(book.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookManagement;
