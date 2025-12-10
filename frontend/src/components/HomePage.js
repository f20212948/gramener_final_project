import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Fixed 3 utilities — always visible with correct icons
const UTILITIES = [
  // Changed type to lowercase for more robust matching against common database standards
  { id: 1, name: 'Electricity', icon: '⚡', type: 'electricity' },
  { id: 2, name: 'Water',       icon: '💧',   type: 'water' },
  { id: 3, name: 'Gas',         icon: '🔥',      type: 'gas' },
];

const API_BASE_URL = 'http://localhost:5000'; // Match the login URL

function HomePage() {
  const [userData, setUserData] = useState({});
  const [bills, setBills] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear the token
    localStorage.removeItem('currentUserId'); // Clear the user ID
    navigate('/login'); // Redirect to login page
  };
  // ----------------------

  useEffect(() => {
    // 1. Get Authentication Details
    const userId = localStorage.getItem('currentUserId');
    const token = localStorage.getItem('authToken');

    if (!userId || !token) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // Config for authenticated requests
    const config = {
      headers: {
        'Authorization': `Bearer ${token}` // Standard JWT Authorization header
      }
    };
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // 2. Corrected API Endpoints with dynamic userId and Authorization header
        const [userRes, billsRes, remindersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users/${userId}`, config),
          axios.get(`${API_BASE_URL}/api/bills/${userId}`, config),
          axios.get(`${API_BASE_URL}/api/reminders/${userId}`, config),
        ]);

        // User Data: userRes.data is expected to be { user: { ... } }
        // Ensure username is used from the user object
        setUserData(userRes.data?.user || { username: 'User' }); 
        
        // Bills Data: billsRes.data is expected to be { bills: [ ... ] }
        const realBills = billsRes.data?.bills || [];
        setBills(realBills);

        // Calculate Total Due from ALL fetched bills
        const total = realBills.reduce((sum, b) => sum + (b.amount || 0), 0);
        setTotalDue(total);

        // Reminders Data: remindersRes.data is expected to be { reminders: [ ... ] }
        setReminders(remindersRes.data?.reminders || []);
        
      } catch (error) {
        console.error('API error while fetching user data:', error);
        // Handle token expiration or invalid user ID by logging out
        if (error.response?.status === 401 || error.response?.status === 404) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUserId');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="loading-spinner">Loading user data...</div>;
  }

  // Find matching bill for a utility
  const getBillFor = (utility) => {
    // *** IMPROVED MATCHING LOGIC ***
    // This assumes the backend is updated to return 'utility_name' 
    // from the utilities table (e.g., 'Electricity', 'Water', 'Gas')
    // We match against the lowercase 'type' from the UTILITIES list.
    return bills.find(b => {
      const name = (b.utility_name || b.provider || b.type || '').toLowerCase();
      return name.includes(utility.type.toLowerCase());
    });
  };

  const daysUntil = (date) => {
    if (!date) return null;
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="homepage-container">
      <header className="welcome-header">
        <h1>Welcome back, {userData.username || 'User'}. It's great to have you back !!!</h1>
        <p>Pay your bills quickly and earn cashback rewards!</p>
        {/* --- LOGOUT BUTTON --- */}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>
  
      <div className="main-layout">
        <div className="utilities-grid">
          {/* Displaying the 3 primary utility cards (Electricity, Water, Gas) */}
          {UTILITIES.map((util) => {
            const bill = getBillFor(util);
            const amount = bill?.amount || 0;
            const dueDate = bill?.due_date;
            const daysLeft = dueDate ? daysUntil(dueDate) : null;
            // Get provider name from the bill object (assuming backend joins utility table)
            const providerName = bill?.provider_name || 'N/A';
  
            return (
              <div key={util.id} className="utility-card">
                <div className="card-header">
                  <span className="icon">{util.icon}</span>
                  <h3>{util.name}</h3>
                </div>
  
                <div className="amount-section">
                  <div className={`amount ${amount === 0 ? 'zero' : ''}`}>
                    Rs. {Number(amount).toFixed(2)}
                  </div>
                  <div className={`due-text ${daysLeft < 0 ? 'overdue' : ''}`}>
                    {dueDate 
                      ? (daysLeft > 0 ? `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` 
                        : daysLeft === 0 ? 'Due today' : 'Overdue')
                      : 'No bill this month'}
                  </div>
                </div>
                
                {/* --- PROVIDER NAME DISPLAY --- */}
                <div className="provider-info">
                  Provider: <strong>{providerName}</strong>
                </div>
                {/* ----------------------------- */}

                <div className="cashback-info">
                  <span>1000+ users received cashback</span>
                </div>
              </div>
            );
          })}
        </div>
  
        <aside className="sidebar">
          {/* Total Amount Due (calculated from ALL fetched bills) */}
          <div className="total-due-card">
            <h3>Total Amount Due</h3>
            <div className={`total-amount ${totalDue === 0 ? 'zero' : ''}`}>
              Rs. {totalDue.toFixed(2)}
            </div>
            <button className="pay-all-btn" disabled={totalDue === 0}>
              {totalDue > 0 ? 'Make Payment' : 'All Paid Up'}
            </button>
          </div>
  
          {/* Upcoming Reminders (displaying ALL fetched reminders) */}
          <div className="reminders-card">
            <h3>Upcoming Reminders</h3>
            {reminders.length === 0 ? (
              <p className="no-reminders">No urgent reminders</p>
            ) : (
              reminders.map((r) => (
                <div key={r.reminder_id} className="reminder-item">
                  {/* Assuming 'Bell' is a placeholder for an icon/emoji */}
                  <span>🔔</span> 
                  <p>{r.message}</p>
                  <small>Date: {r.reminder_date}</small>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default HomePage;