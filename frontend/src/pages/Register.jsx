import React from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();

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

                <div className="mb-3">
                    <label className="form-label text-light">Full Name</label>
                    <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label text-light">Email Address</label>
                    <input
                        type="email"
                        className="form-control bg-dark border-secondary text-white"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label text-light">Password</label>
                    <input
                        type="password"
                        className="form-control bg-dark border-secondary text-white"
                    />
                </div>

                <div className="d-grid mb-3">
                    <button type="submit" className="btn btn-secondary">
                        Register
                    </button>
                </div>

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