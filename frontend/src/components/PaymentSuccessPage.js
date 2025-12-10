import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalPaid = 0, receipts = [] } = location.state || {};

  const handleGoHome = () => {
    navigate('/home', { replace: true });
  };

  return (
    <div>
      <h1>✅ Payment Successful!</h1>
      <p>Total Amount Paid: Rs. {totalPaid}</p>
      <h3>Receipts</h3>
      {receipts.map(receipt => (
        <div key={receipt.payment_id}>
          <p>Bill ID: {receipt.bill_id}</p>
          <p>Amount Paid: Rs. {receipt.amount}</p>
          <p>Payment Method: {receipt.payment_method}</p>
          <p>Status: {receipt.status}</p>
        </div>
      ))}
      <button onClick={handleGoHome}>Return to Home</button>
    </div>
  );
}

export default PaymentSuccessPage;
