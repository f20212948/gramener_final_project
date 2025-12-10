import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const checkResponse = await axios.post('http://localhost:8000/checkUser', {
        username,
        email
      });

      if (checkResponse.data.exists) {
        setError('Username or Email already exists. Please choose another.');
        return;
      }

      const response = await axios.post('http://localhost:8000/register', {
        username,
        password,
        email,
        phoneNumber,
        pan,
        aadhaar,
      });

      if (response.status === 200) {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError('Registration failed. Please try again later.');
    }
  };

  return (
    <div className="register-page-wrapper">
      {/* Full-screen Background - Same as Login */}
      <div className="register-background"></div>

      {/* Glassmorphism Register Card */}
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Payment Platform and pay bills effortlessly</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="PAN Number (e.g. ABCDE1234F)"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            required
          />
          <input
            type="text"
            placeholder="Aadhaar Number (12 digits)"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            maxLength="12"
            required
          />

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;