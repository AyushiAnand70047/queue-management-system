import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const navigate = useNavigate();

  const url = import.meta.env.VITE_BACKEND_URL;

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/manager/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem('managerId', response.data.managerId);
      alert('Login Successful!');
      navigate('/manager/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed';
      alert(message);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      alert('Please fill in all the fields.');
      return;
    }
    try {
      const result = await axios.post(`${url}/manager/register`, {
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      if (result.status === 200 || result.status === 201) {
        alert('Registration successful! Please login.');
        setActiveTab('login');
        // Optionally clear register form fields
        setRegName('');
        setRegEmail('');
        setRegPassword('');
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Registration failed. Please try again later.';
      alert(msg);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: '#fff' }}
    >
      <div
        className="card p-5 shadow"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '1rem',
          backgroundColor: '#f6f9fd',
        }}
      >
        {/* Tabs */}
        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {/* Form */}
        {activeTab === 'login' ? (
          <>
            <div className="text-center mb-4">
              <h3 className="fw-bold">Welcome Back!</h3>
              <p className="text-dark small">Please sign in to continue</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-white border-secondary text-dark"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control bg-white border-secondary text-dark"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid mt-5 mb-2">
                <button
                  type="submit"
                  className="btn btn-primary fw-semibold"
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#1f65abff')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '')}
                >
                  Sign In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <h3 className="fw-bold">Create Account</h3>
              <p className="text-dark small">Join us and start managing</p>
            </div>

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label text-dark">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-light border-secondary text-dark"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-dark">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light border-secondary text-dark"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-dark">Password</label>
                <input
                  type="password"
                  className="form-control bg-light border-secondary text-dark"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid mt-5 mb-3">
                <button
                  type="submit"
                  className="btn btn-primary fw-semibold"
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseDown={(e) => (e.target.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  Register
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;