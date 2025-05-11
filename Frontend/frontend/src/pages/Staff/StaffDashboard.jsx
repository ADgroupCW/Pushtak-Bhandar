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
    <div className="sd-container">
      {/* Header */}
      <header className="sd-header">
        <div className="sd-header-container">
          <div className="sd-header-title">
            <h1 className="sd-page-title">Staff Dashboard</h1>
          </div>
          <div className="sd-user-section">
            
            <button className="sd-logout-button" onClick={handleLogout}>
              <LogOut className="sd-icon" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="sd-main">
        {/* Stats */}
        <div className="sd-stats-grid">
          <StatCard icon={<ShoppingCart />} label="Pending Orders" value={stats.pendingOrdersCount} color="orders" />
          <StatCard icon={<Clock />} label="Completed Orders" value={stats.completedOrdersCount} color="processed" />
          <StatCard icon={<Book />} label="Books Handled" value={stats.totalBooksHandled} color="books" />
          <StatCard icon={<User />} label="Revenue ($)" value={stats.totalRevenue.toFixed(2)} color="customers" />
        </div>

        {/* Tabs */}
        <div className="sd-tabs-container">
          <nav className="sd-tabs-nav">
            
            <button
              onClick={() => setActiveTab('history')}
              className={`sd-tab-button ${activeTab === 'history' ? 'sd-tab-active' : 'sd-tab-inactive'}`}
            >
              Order History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="sd-content">
          {activeTab === 'process' ? (
            <>
              <TabContent
                icon={<ShoppingCart className="sd-empty-icon" />}
                title="Ready to process orders"
                description="Enter a claim code to verify and complete customer orders."
                buttonText="Go to Full Order Portal"
                onClick={() => navigate('/stafforder')}
              />
              <div style={{ marginTop: '2rem' }}>
                <ClaimCodeVerify />
              </div>
            </>
          ) : (
            <>
              <div className="sd-empty-content">
                <h3 className="sd-empty-title">Completed Orders</h3>
                <p className="sd-empty-description">All fulfilled orders by the staff are listed below.</p>
              </div>
              <table className="sd-history-table">
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
                  {completedOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>{order.orderId}</td>
                      <td>{order.userEmail}</td>
                      <td>{order.claimCode}</td>
                      <td>{order.status}</td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                      <td>{new Date(order.orderedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Reusable components
function StatCard({ icon, label, value, color }) {
  return (
    <div className="sd-stat-card">
      <div className="sd-stat-card-inner">
        <div className="sd-stat-content">
          <div className={`sd-stat-icon-container sd-stat-icon-${color}`}>
            {icon}
          </div>
          <div className="sd-stat-text">
            <dl>
              <dt className="sd-stat-label">{label}</dt>
              <dd className="sd-stat-value">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabContent({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="sd-empty-state">
      <div className="sd-empty-content">
        {icon}
        <h3 className="sd-empty-title">{title}</h3>
        <p className="sd-empty-description">{description}</p>
        <div className="sd-action-button-container">
          <button className="sd-action-button" onClick={onClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
