// HomePage.js (Full updated file)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { differenceInDays, parseISO } from 'date-fns'; 

// Fixed 3 utilities
const UTILITIES = [
  { id: 1, name: 'Electricity', icon: '⚡', type: 'electricity' },
  { id: 2, name: 'Water',       icon: '💧',   type: 'water' },
  { id: 3, name: 'Gas',         icon: '🔥',      type: 'gas' },
];

const API_BASE_URL = 'http://localhost:5000';

function HomePage() {
  const [userData, setUserData] = useState({});
  const [bills, setBills] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  // State for payment feedback
  const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' }); 
  const navigate = useNavigate();

  // --- LOGOUT HANDLER (existing) ---
  const handleLogout = () => {
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('currentUserId'); 
    navigate('/login');
  };
  // ----------------------------------------

  // --- NEW PAYMENT HANDLER ---
  const handlePayment = async (billId, amount) => {
    const userId = localStorage.getItem('currentUserId');
    const token = localStorage.getItem('authToken');

    if (!userId || !token) {
      navigate('/login');
      return;
    }

    setPaymentMessage({ type: 'info', text: 'Processing payment...' });

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    try {
      const response = await axios.post(
        // Use the new API endpoint
        `${API_BASE_URL}/api/payments/process/${userId}`, 
        { bill_id: billId, amount: amount }, 
        config
      );

      if (response.status === 200) {
        setPaymentMessage({ type: 'success', text: response.data.message || 'Payment successful!' });
        
        // Refresh data to show the bill as paid
        fetchData(); 
      }
    } catch (error) {
      let message = 'Payment failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      setPaymentMessage({ type: 'error', text: message });
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setPaymentMessage({ type: '', text: '' }), 5000);
  };
  // ---------------------------

  const fetchData = async () => {
    const userId = localStorage.getItem('currentUserId');
    const token = localStorage.getItem('authToken');

    if (!userId || !token) {
      navigate('/login');
      return;
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      setLoading(true);
      const [userRes, billsRes, remindersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users/${userId}`, config),
        axios.get(`${API_BASE_URL}/api/bills/${userId}`, config),
        axios.get(`${API_BASE_URL}/api/reminders/${userId}`, config),
      ]);

      setUserData(userRes.data || { username: 'User' });
      
      const realBills = billsRes.data?.bills || [];
      // Calculate total due only for 'Pending' bills
      const total = realBills.reduce((sum, b) => sum + (b.status === 'Pending' ? (b.amount || 0) : 0), 0);
      setTotalDue(total);

      setBills(realBills);
      setReminders(remindersRes.data?.reminders || []);
    } catch (error) {
      console.error('API error:', error.response || error);
      if (error.response && error.response.status === 401) {
        navigate('/login'); 
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="home-container">Loading your dashboard...</div>;
  }
  
  // Helper to match bill to its utility icon/name
  const getUtilityInfo = (billType) => UTILITIES.find(u => u.type.toLowerCase() === billType?.toLowerCase()) || { name: 'Unknown', icon: '❓' };

  return (
    <div className="home-container">
      <header className="main-header">
        <div className="user-welcome">
          <h2>Hello, {userData.username || 'User'}!</h2>
          <p>Manage your utility bills efficiently.</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>
      
      {/* Payment Feedback Message */}
      {paymentMessage.text && (
        <div className={`payment-alert ${paymentMessage.type === 'error' ? 'error' : paymentMessage.type === 'success' ? 'success' : 'info'}`}>
          {paymentMessage.text}
        </div>
      )}

      <div className="main-content">
        <div className="bill-grid">
          {bills.length === 0 ? (
            <p className="no-bills-message">No bills found. You're all caught up!</p>
          ) : bills.map((bill) => {
            const utility = getUtilityInfo(bill.utility_type);
            const isPaid = bill.status === 'Paid'; 
            const dueDate = bill.due_date ? parseISO(bill.due_date) : null;
            const daysLeft = dueDate ? differenceInDays(dueDate, new Date()) : 0;
            
            return (
              <div key={bill.bill_id} className={`bill-card ${isPaid ? 'paid' : ''}`}>
                <div className="bill-icon">{utility.icon}</div>
                <div className="bill-details">
                  <h3>{utility.name}</h3>
                  <p>Rs. {bill.amount ? bill.amount.toFixed(2) : '0.00'}</p>
                  
                  {/* Status Indicator */}
                  <div className={`status-tag ${bill.status?.toLowerCase()}`}>{bill.status || 'Pending'}</div>
                  
                  <div className={`due-text ${daysLeft < 0 ? 'overdue' : ''}`}>
                    {dueDate 
                      ? (daysLeft > 0 ? `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` 
                        : daysLeft === 0 ? 'Due today' : 'Due on ' + bill.due_date)
                      : 'No due date'}
                  </div>
                </div>

                <div className="bill-actions">
                  {/* --- NEW PAYMENT BUTTON --- */}
                  <button 
                    className="pay-now-btn" 
                    onClick={() => handlePayment(bill.bill_id, bill.amount)}
                    disabled={isPaid}
                  >
                    {isPaid ? 'Paid' : 'Pay Now'}
                  </button>
                  {/* -------------------------- */}
                </div>
                
                <div className="cashback-info">
                  <span>1000+ users received cashback</span>
                </div>
              </div>
            );
          })}
        </div>
  
        <aside className="sidebar">
          {/* Total Amount Due (calculated from only Pending bills) */}
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