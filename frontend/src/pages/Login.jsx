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
        password
      });
      console.log(response.data);
      localStorage.setItem('managerId', response.data.managerId);
      alert("Login Successful!");
      navigate('/manager/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      alert(message);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#000' }}>
      <div
        className="card text-white p-4 shadow"
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '1rem',
          backgroundColor: '#0d1117',
        }}
      >
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="fw-bold">Welcome Back</h3>
          <p className="text-light small">Please sign in to continue</p>
        </div>

        {/* Toggle Tabs */}
        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${activeTab === 'manager' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => setActiveTab('manager')}
          >
            Manager
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'user' ? 'btn-light' : 'btn-outline-light'}`}
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
                  className="form-control bg-dark border-secondary text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control bg-dark border-secondary text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#5c636a'}
                  onMouseOut={(e) => e.target.style.backgroundColor = ''}
                >
                  Sign in
                </button>
              </div>

              <hr className="border-secondary my-3" />

              <div className="d-grid">
                <span className="text-light mb-2">New user? </span>
                <button type="button" className="btn btn-outline-light" onClick={() => navigate('/register')}>
                  <i className="bi bi-google me-2"></i> Register
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Token ID</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="Enter your Token ID"
                />
              </div>

              <div className="d-grid">
                <button type="button" className="btn btn-secondary">
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
