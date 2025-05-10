import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/EditBook.css';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [formats, setFormats] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [modalType, setModalType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [bookRes, genreRes, pubRes, awardRes, formatRes] = await Promise.all([
        api.get(`/Book/${id}`),
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
        api.get('/meta/formats'),
      ]);

      setGenres(genreRes.data);
      setPublishers(pubRes.data);
      setAwards(awardRes.data);
      setFormats(formatRes.data);

      const b = bookRes.data;
      setBook({
        ...b,
        genreId: genreRes.data.find(g => g.name === b.genreName)?.id || '',
        publisherId: pubRes.data.find(p => p.name === b.publisherName)?.id || '',
        bookAwardIds: awardRes.data.filter(a => b.bookAwardNames.includes(a.name)).map(a => a.id),
        bookFormatIds: formatRes.data.filter(f => b.bookFormatNames.includes(f.name)).map(f => f.id),
      });
      setImagePreview(`http://localhost:5046${b.imageUrl}`);
    } catch (err) {
      console.error('Failed to load book', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBook({ ...book, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleMultiSelect = (field, id) => {
    const updated = book[field].includes(id)
      ? book[field].filter(i => i !== id)
      : [...book[field], id];
    setBook({ ...book, [field]: updated });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const openModal = (type) => {
    setModalType(type);
    setNewItemName('');
    setShowModal(true);
  };

  const submitNewItem = async () => {
    try {
      const res = await api.post(`/meta/${modalType.toLowerCase()}s`, { name: newItemName });
      setShowModal(false);
      fetchData();
    } catch {
      alert('Failed to add new item');
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();

            // ✅ List of scalar fields
            const scalarFields = [
            'title', 'author', 'isbn', 'description', 'language',
            'publicationDate', 'price', 'originalPrice',
            'isAvailableInStore', 'isOnSale', 'saleStartDate',
            'saleEndDate', 'stockCount', 'genreId', 'publisherId'
            ];

            // Append scalar fields
            scalarFields.forEach(field => {
            const value = book[field];
            fd.append(field, value ?? '');
            });

            // ✅ Append arrays using correct format (bookAwardIds[] and bookFormatIds[])
            book.bookAwardIds.forEach(id => fd.append('bookAwardIds[]', id));
            book.bookFormatIds.forEach(id => fd.append('bookFormatIds[]', id));

            // ✅ Append image file if present
            if (imageFile) {
            fd.append('imageFile', imageFile);
            }

            // Debug log for confirmation
            console.log('📤 Final FormData to send:');
            for (let [k, v] of fd.entries()) {
            console.log(`${k}: ${v}`);
            }

            // Submit PUT request
            await api.put(`/Book/${id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate('/admin/books');
        } catch (err) {
            console.error(err);
            alert('Update failed.');
        }
    };


  if (!book) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="edit-book-container">
          <h2>Edit Book</h2>
          <form onSubmit={handleSubmit} className="form-container">
            <input name="title" value={book.title} onChange={handleChange} placeholder="Title" required />
            <input name="author" value={book.author} onChange={handleChange} placeholder="Author" required />
            <input name="isbn" value={book.isbn} onChange={handleChange} placeholder="ISBN" required />
            <input name="language" value={book.language} onChange={handleChange} placeholder="Language" />
            <input type="date" name="publicationDate" value={book.publicationDate?.split('T')[0]} onChange={handleChange} />
            <input type="number" step="0.01" name="price" value={book.price} onChange={handleChange} placeholder="Price" required />
            <input type="number" step="0.01" name="originalPrice" value={book.originalPrice || ''} onChange={handleChange} placeholder="Original Price" />
            <input type="number" name="stockCount" value={book.stockCount} onChange={handleChange} placeholder="Stock Count" />

            <div className="inline-group">
              <select name="genreId" value={book.genreId} onChange={handleChange} required>
                <option value="">-- Select Genre --</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <button type="button" onClick={() => openModal('genre')}>+ Add</button>
            </div>

            <div className="inline-group">
              <select name="publisherId" value={book.publisherId} onChange={handleChange} required>
                <option value="">-- Select Publisher --</option>
                {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="button" onClick={() => openModal('publisher')}>+ Add</button>
            </div>

            <label>Awards</label>
            <div className="tag-box">
              {awards.map(a => (
                <span key={a.id} className={`tag ${book.bookAwardIds.includes(a.id) ? 'selected' : ''}`}
                  onClick={() => toggleMultiSelect('bookAwardIds', a.id)}>{a.name}</span>
              ))}
              <button type="button" onClick={() => openModal('award')}>+ Add Award</button>
            </div>

            <label>Formats</label>
            <div className="tag-box">
              {formats.map(f => (
                <span key={f.id} className={`tag ${book.bookFormatIds.includes(f.id) ? 'selected' : ''}`}
                  onClick={() => toggleMultiSelect('bookFormatIds', f.id)}>{f.name}</span>
              ))}
              <button type="button" onClick={() => openModal('format')}>+ Add Format</button>
            </div>

            <label>
              <input type="checkbox" name="isAvailableInStore" checked={book.isAvailableInStore} onChange={handleChange} />
              Available In Store
            </label>
            <label>
              <input type="checkbox" name="isOnSale" checked={book.isOnSale} onChange={handleChange} />
              On Sale
            </label>

            <input type="date" name="saleStartDate" value={book.saleStartDate?.split('T')[0]} onChange={handleChange} />
            <input type="date" name="saleEndDate" value={book.saleEndDate?.split('T')[0]} onChange={handleChange} />

            <label>Cover Image</label>
            {imagePreview && <img src={imagePreview} alt="Preview" width="100" style={{ borderRadius: '6px', marginBottom: '10px' }} />}
            <input type="file" accept="image/*" onChange={handleImageChange} />

            <div className="form-buttons">
              <button type="submit" className="btn primary">💾 Update</button>
              <button type="button" className="btn" onClick={() => navigate('/admin/bookmanagement')}>← Cancel</button>
            </div>
          </form>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Add New {modalType}</h3>
                <input type="text" placeholder={`${modalType} Name`} value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)} />
                <div className="modal-buttons">
                  <button onClick={submitNewItem}>Add</button>
                  <button onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBook;
