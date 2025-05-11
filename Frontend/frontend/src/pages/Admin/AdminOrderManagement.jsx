import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put('/admin/orders/status', { orderId, newStatus });
      fetchAllOrders();
    } catch (err) {
      console.error('❌ Failed to update status:', err);
      alert('Failed to update status.');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = orders.filter(order =>
      order.claimCode.toLowerCase().includes(query) ||
      order.userEmail.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  };

  const openOrderDetail = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error('❌ Could not load order details:', err);
      alert('Could not load order details.');
    }
  };

  const formatCurrency = (val) =>
    typeof val === 'number' && !isNaN(val) ? `$${val.toFixed(2)}` : '—';

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />

      <div style={{ flex: 1, padding: '20px' }}>
        <h2>📦 Admin Order Management</h2>

        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by claim code or email..."
          style={{
            marginBottom: '20px',
            padding: '10px',
            width: '300px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />

        {loading ? (
          <p>⏳ Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p>⚠️ No matching orders found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={th}>Order ID</th>
                <th style={th}>User Email</th>
                <th style={th}>Claim Code</th>
                <th style={th}>Status</th>
                <th style={th}>Total</th>
                <th style={th}>Ordered At</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.orderId} onClick={() => openOrderDetail(order.orderId)} style={{ cursor: 'pointer' }}>
                  <td style={td}>{order.orderId}</td>
                  <td style={td}>{order.userEmail}</td>
                  <td style={td}>{order.claimCode}</td>
                  <td style={td}>
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      style={{ padding: '4px 6px' }}
                    >
                      {['Pending', 'Completed', 'Cancelled'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td style={td}>{formatCurrency(order.totalAmount)}</td>
                  <td style={td}>{new Date(order.orderedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {modalOpen && selectedOrder && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>Order #{selectedOrder.orderId} Details</h3>
              <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
              <p><strong>Claim Code:</strong> {selectedOrder.claimCode}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Ordered At:</strong> {new Date(selectedOrder.orderedAt).toLocaleString()}</p>

              <h4>Items:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Title</th>
                    <th style={th}>Quantity</th>
                    <th style={th}>Unit Price</th>
                    <th style={th}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.bookId}>
                      <td style={td}>{item.title}</td>
                      <td style={td}>{item.quantity}</td>
                      <td style={td}>{formatCurrency(item.unitPrice)}</td>
                      <td style={td}>{formatCurrency(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Summary:</h4>
              <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>

              <button onClick={() => setModalOpen(false)} style={{ marginTop: '20px' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const th = {
  padding: '12px',
  borderBottom: '2px solid #ddd',
  textAlign: 'left'
};

const td = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalBox = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '600px',
  maxHeight: '80vh',
  overflowY: 'auto'
};

export default AdminOrderManagement;
