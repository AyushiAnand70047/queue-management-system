import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [activeTab, setActiveTab] = useState('manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await axios.post(`${url}/manager/login`, {
        email,
        password,
      });
      localStorage.setItem('managerId', response.data.managerId);
      alert('Login Successful!');
      navigate('/manager/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed';
      alert(message);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#fff' }}>
      <div
        className="card p-4 shadow"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '1rem',
          backgroundColor: '#f6f9fd',
        }}
      >
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="fw-bold">Welcome Back</h3>
          <p className="text-dark small">Please sign in to continue</p>
        </div>

        {/* Toggle Tabs */}
        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${activeTab === 'manager' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('manager')}
          >
            Manager
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'user' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('user')}
          >
            User
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'manager' ? (
            <>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-white border-secondary text-dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control bg-white border-secondary text-dark"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-primary fw-semibold"
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#1f65abff')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '')}
                >
                  Sign in
                </button>
              </div>

              <hr className="border-secondary my-3" />

              <div className="d-grid">
                <span className="text-dark mb-2 text-center">New user?</span>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: '#987048ff',
                    color: 'white',
                    fontWeight: '500',
                    transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#7b5631ff')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#b18252ff')}
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Token ID</label>
                <input
                  type="text"
                  className="form-control bg-white border-secondary text-dark"
                  placeholder="Enter your Token ID"
                />
              </div>

              <div className="d-grid">
                <button type="button" className="btn btn-primary">
                  Show Details
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
