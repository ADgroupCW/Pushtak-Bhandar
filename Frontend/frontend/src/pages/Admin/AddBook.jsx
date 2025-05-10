import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import '../../styles/AddBook.css';
import { useNavigate } from 'react-router-dom';

export default function AddBook() {
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', language: 'English', publicationDate: '',
    price: '', originalPrice: '', stockCount: '', isAvailableInStore: true, isOnSale: false,
    saleStartDate: '', saleEndDate: '', genreId: '', publisherId: '',
    bookAwardIds: [], bookFormatIds: []
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
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
        api.get('/meta/formats')
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
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleMultiSelect = (type, id) => {
    const field = type === 'Award' ? 'bookAwardIds' : 'bookFormatIds';
    const selected = form[field].includes(id)
      ? form[field].filter(i => i !== id)
      : [...form[field], id];
    setForm({ ...form, [field]: selected });
  };

  const removeSelectedItem = (type, id) => {
    const field = type === 'Award' ? 'bookAwardIds' : 'bookFormatIds';
    const updated = form[field].filter(i => i !== id);
    setForm({ ...form, [field]: updated });
  };

  const openModal = (type) => {
    setModalType(type);
    setNewItemName('');
    setShowModal(true);
  };

  const submitNewItem = async () => {
    try {
      await api.post(`/meta/${modalType.toLowerCase()}s`, { name: newItemName });
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
  
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(val => fd.append(`${key}[]`, val));  // 👈 FIXED HERE
        } else {
          fd.append(key, value ?? '');
        }
      });
      if (imageFile) fd.append('imageFile', imageFile);
  
      // ✅ Log after data has been added
      console.log('📤 SUBMITTING FORM DATA:');
      for (let pair of fd.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
  
      await api.post('/Book', fd, {
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
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Author</label>
        <input name="author" value={form.author} onChange={handleChange} required />

        <label>ISBN</label>
        <input name="isbn" value={form.isbn} onChange={handleChange} required />

        <label>Language</label>
        <input name="language" value={form.language} onChange={handleChange} />

        <label>Publication Date</label>
        <input type="date" name="publicationDate" value={form.publicationDate} onChange={handleChange} required />

        <label>Price</label>
        <input type="number" name="price" value={form.price} onChange={handleChange} required />

        <label>Original Price</label>
        <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} />

        <label>Stock Count</label>
        <input type="number" name="stockCount" value={form.stockCount} onChange={handleChange} required />

        <label>Genre</label>
        <div className="inline-group">
          <select name="genreId" value={form.genreId} onChange={handleChange} required>
            <option value="">-- Select Genre --</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button type="button" onClick={() => openModal('genre')}>+ Add</button>
        </div>

        <label>Publisher</label>
        <div className="inline-group">
          <select name="publisherId" value={form.publisherId} onChange={handleChange} required>
            <option value="">-- Select Publisher --</option>
            {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button type="button" onClick={() => openModal('publisher')}>+ Add</button>
        </div>

        <label>Awards</label>
        <div className="inline-group">
          <select onChange={e => {
            const id = parseInt(e.target.value);
            if (id && !form.bookAwardIds.includes(id)) {
              setForm({ ...form, bookAwardIds: [...form.bookAwardIds, id] });
            }
          }}>
            <option value="">-- Select Award --</option>
            {awards.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button type="button" onClick={() => openModal('award')}>+ Add Award</button>
        </div>
        <div className="tag-box">
          {form.bookAwardIds.map(id => {
            const award = awards.find(a => a.id === id);
            return award ? (
              <span key={id} className="tag selected">
                {award.name} <button type="button" onClick={() => removeSelectedItem('Award', id)}>x</button>
              </span>
            ) : null;
          })}
        </div>

        <label>Formats</label>
        <div className="inline-group">
          <select onChange={e => {
            const id = parseInt(e.target.value);
            if (id && !form.bookFormatIds.includes(id)) {
              setForm({ ...form, bookFormatIds: [...form.bookFormatIds, id] });
            }
          }}>
            <option value="">-- Select Format --</option>
            {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button type="button" onClick={() => openModal('format')}>+ Add Format</button>
        </div>
        <div className="tag-box">
          {form.bookFormatIds.map(id => {
            const format = formats.find(f => f.id === id);
            return format ? (
              <span key={id} className="tag selected">
                {format.name} <button type="button" onClick={() => removeSelectedItem('Format', id)}>x</button>
              </span>
            ) : null;
          })}
        </div>

        <label>
          <input type="checkbox" name="isAvailableInStore" checked={form.isAvailableInStore} onChange={handleChange} />
          Available in Store
        </label>

        <label>
          <input type="checkbox" name="isOnSale" checked={form.isOnSale} onChange={handleChange} />
          On Sale
        </label>

        <label>Sale Start Date</label>
        <input type="date" name="saleStartDate" value={form.saleStartDate} onChange={handleChange} />

        <label>Sale End Date</label>
        <input type="date" name="saleEndDate" value={form.saleEndDate} onChange={handleChange} />

        <label>Book Cover Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required />

        <button type="submit" className="submit-btn">Add Book</button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
            <input type="text" placeholder={`${modalType} Name`} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={submitNewItem}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
