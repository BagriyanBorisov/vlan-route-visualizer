import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting login with:', credentials);
      const response = await axios.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      setSuccess('Login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
          <strong>Demo credentials:</strong><br/>
          admin / admin123<br/>
          user / user123<br/>
          demo / demo123
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleInputChange}
              className="input w-full"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleInputChange}
              className="input w-full"
              disabled={loading}
              required
            />
          </div>
          <button 
            type="submit" 
            className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 