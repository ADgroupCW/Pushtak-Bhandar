import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/AddBook.css';
import { useNavigate } from 'react-router-dom';

export default function AddBook() {
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    language: 'English',
    publicationDate: '',
    price: '',
    originalPrice: '',
    stockCount: '',
    isAvailableInStore: true,
    isOnSale: false,
    saleStartDate: '',
    saleEndDate: '',
    genreId: '',
    publisherId: '',
    bookAwardIds: [],
    bookFormatIds: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [formats, setFormats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [g, p, a, f] = await Promise.all([
        axios.get('/api/genre'),
        axios.get('/api/publisher'),
        axios.get('/api/award'),
        axios.get('/api/format')
      ]);
      setGenres(g.data);
      setPublishers(p.data);
      setAwards(a.data);
      setFormats(f.data);
    } catch (err) {
      console.error('Dropdown fetch failed:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: updated });
  };

  const toggleMultiSelect = (type, id) => {
    const field = type === 'Award' ? 'bookAwardIds' : 'bookFormatIds';
    const selected = form[field].includes(id)
      ? form[field].filter(i => i !== id)
      : [...form[field], id];
    setForm({ ...form, [field]: selected });
  };

  const openModal = (type) => {
    setModalType(type);
    setNewItemName('');
    setShowModal(true);
  };

  const submitNewItem = async () => {
    try {
      const res = await axios.post(`/api/${modalType.toLowerCase()}`, { name: newItemName });
      setShowModal(false);
      fetchDropdowns();
    } catch (err) {
      alert(`Failed to add new ${modalType}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach(val => fd.append(k, val));
        } else {
          fd.append(k, v ?? '');
        }
      });
      if (imageFile) fd.append('imageFile', imageFile);

      await axios.post('/api/book', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Book added successfully!');
      setTimeout(() => navigate('/admin/books'), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to add book.');
    }
  };

  return (
    <div className="add-book-container">
      <h2>Add New Book</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="add-book-form">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} required />

            <label htmlFor="author">Author</label>
            <input id="author" name="author" value={form.author} onChange={handleChange} required />

            <label htmlFor="isbn">ISBN</label>
            <input id="isbn" name="isbn" value={form.isbn} onChange={handleChange} required />

            <label htmlFor="language">Language</label>
            <input id="language" name="language" value={form.language} onChange={handleChange} />

            <label htmlFor="publicationDate">Publication Date</label>
            <input id="publicationDate" type="date" name="publicationDate" value={form.publicationDate} onChange={handleChange} required />

            <label htmlFor="price">Price</label>
            <input id="price" type="number" name="price" value={form.price} onChange={handleChange} required />

            <label htmlFor="originalPrice">Original Price</label>
            <input id="originalPrice" type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} />

            <label htmlFor="stockCount">Stock Count</label>
            <input id="stockCount" type="number" name="stockCount" value={form.stockCount} onChange={handleChange} required />

            <label>Genre</label>
            <div className="inline-group">
                <select name="genreId" value={form.genreId} onChange={handleChange} required>
                <option value="">-- Select Genre --</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <button type="button" onClick={() => openModal('Genre')}>+ Add</button>
            </div>

            <label>Publisher</label>
            <div className="inline-group">
                <select name="publisherId" value={form.publisherId} onChange={handleChange} required>
                <option value="">-- Select Publisher --</option>
                {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="button" onClick={() => openModal('Publisher')}>+ Add</button>
            </div>

            <label>Awards</label>
            <div className="tag-box">
                {awards.map(a => (
                <span
                    key={a.id}
                    className={`tag ${form.bookAwardIds.includes(a.id) ? 'selected' : ''}`}
                    onClick={() => toggleMultiSelect('Award', a.id)}
                >
                    {a.name}
                </span>
                ))}
                <button type="button" onClick={() => openModal('Award')}>+ Add Award</button>
            </div>

            <label>Formats</label>
            <div className="tag-box">
                {formats.map(f => (
                <span
                    key={f.id}
                    className={`tag ${form.bookFormatIds.includes(f.id) ? 'selected' : ''}`}
                    onClick={() => toggleMultiSelect('Format', f.id)}
                >
                    {f.name}
                </span>
                ))}
                <button type="button" onClick={() => openModal('Format')}>+ Add Format</button>
            </div>

            <label>
                <input type="checkbox" name="isAvailableInStore" checked={form.isAvailableInStore} onChange={handleChange} />
                Available in Store
            </label>

            <label>
                <input type="checkbox" name="isOnSale" checked={form.isOnSale} onChange={handleChange} />
                On Sale
            </label>

            <label htmlFor="saleStartDate">Sale Start Date</label>
            <input id="saleStartDate" type="date" name="saleStartDate" value={form.saleStartDate} onChange={handleChange} />

            <label htmlFor="saleEndDate">Sale End Date</label>
            <input id="saleEndDate" type="date" name="saleEndDate" value={form.saleEndDate} onChange={handleChange} />

            <label htmlFor="imageFile">Book Cover Image</label>
            <input id="imageFile" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required />

            <button type="submit" className="submit-btn">Add Book</button>
            </form>


      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New {modalType}</h3>
            <input
              type="text"
              placeholder={`${modalType} Name`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="submit" onClick={submitNewItem}>Add</button>
              <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
