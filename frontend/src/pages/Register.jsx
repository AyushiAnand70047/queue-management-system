import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = import.meta.env.VITE_BACKEND_URL;

        if (!name || !email || !password) {
            alert("Please fill in all the fields.");
            return;
        }

        axios.post(`${url}/manager/register`, { name, email, password })
            .then((result) => {
                console.log(result);
                if (result.status === 200 || result.status === 201) {
                    navigate('/');
                } else {
                    alert("Registration failed. Please try again.");
                }
            })
            .catch((err) => {
                console.error(err);
                // ✅ Check if backend sent a specific message
                if (err.response && err.response.data && err.response.data.message) {
                    alert(err.response.data.message);
                } else {
                    alert("Registration failed. Please try again later.");
                }
            });
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
                    <h3 className="fw-bold">Create Account</h3>
                    <p className="text-light small">Please fill in the details to register</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-light">Full Name</label>
                        <input
                            type="text"
                            className="form-control bg-dark border-secondary text-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-light">Email Address</label>
                        <input
                            type="email"
                            className="form-control bg-dark border-secondary text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-light">Password</label>
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
                                transform: 'scale(1)',
                            }}
                            onMouseDown={(e) => (e.target.style.transform = 'scale(0.95)')}
                            onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
                            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                        >
                            Register
                        </button>

                    </div>
                </form>

                <hr className="border-secondary my-3" />

                <div className="text-center">
                    <span className="text-light">Already have an account? </span>
                    <button type="button" className="btn btn-link text-decoration-none text-info p-0 ms-1" onClick={() => navigate('/')}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;