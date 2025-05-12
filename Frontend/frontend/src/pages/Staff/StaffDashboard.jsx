import { useState, useEffect } from 'react';
import { Book, ShoppingCart, Clock, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClaimCodeVerify from './ClaimCodeVerify';
import api from '../../api/api';
import '../../styles/StaffDashboard.css';



export default function StaffDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('process');

  const [stats, setStats] = useState({
    pendingOrdersCount: 0,
    completedOrdersCount: 0,
    totalBooksHandled: 0,
    totalRevenue: 0
  });

  const [completedOrders, setCompletedOrders] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'history') {
      fetchCompletedOrders();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/staff/orders/stats');
      setStats(res.data);
      console.log('📊 Stats loaded:', res.data);
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const res = await api.get('/staff/orders/completed');
      setCompletedOrders(res.data);
      console.log('📦 Completed orders:', res.data);
    } catch (err) {
      console.error('❌ Failed to fetch completed orders:', err);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <h1>Staff Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Cards */}
        <section className="stats-section">
          <StatCard 
            icon={<ShoppingCart size={24} />} 
            label="Pending Orders" 
            value={stats.pendingOrdersCount} 
            variant="pending"
          />
          <StatCard 
            icon={<Clock size={24} />} 
            label="Completed Orders" 
            value={stats.completedOrdersCount} 
            variant="completed"
          />
          <StatCard 
            icon={<Book size={24} />} 
            label="Books Handled" 
            value={stats.totalBooksHandled} 
            variant="books"
          />
          <StatCard 
            icon={<User size={24} />} 
            label="Revenue" 
            value={`$${stats.totalRevenue.toFixed(2)}`} 
            variant="revenue"
          />
        </section>

        {/* Tabs */}
        <section className="tabs-section">
          <div className="tabs-container">
            <button 
              className={`tab-button ${activeTab === 'process' ? 'active' : ''}`}
              onClick={() => setActiveTab('process')}
            >
              Process Orders
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Order History
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'process' ? (
              <div className="process-tab">
                <div className="tab-header">
                  <ShoppingCart size={24} />
                  <h2>Ready to process orders</h2>
                  <p>Enter a claim code to verify and complete customer orders.</p>
               
                </div>
                <div className="claim-code-container">
                  <ClaimCodeVerify />
                </div>
              </div>
            ) : (
              <div className="history-tab">
                <div className="tab-header">
                  <Clock size={24} />
                  <h2>Completed Orders</h2>
                  <p>All fulfilled orders by the staff are listed below.</p>
                </div>
                <div className="table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>User Email</th>
                        <th>Claim Code</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Ordered At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrders.length > 0 ? (
                        completedOrders.map((order) => (
                          <tr key={order.orderId}>
                            <td>{order.orderId}</td>
                            <td>{order.userEmail}</td>
                            <td>{order.claimCode}</td>
                            <td>
                              <span className="status-badge">{order.status}</span>
                            </td>
                            <td>${order.totalAmount.toFixed(2)}</td>
                            <td>{new Date(order.orderedAt).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="no-data">No completed orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-details">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}