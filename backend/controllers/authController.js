const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const database = require('../config/database');

// JWT secret key (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authController = {
  // User login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // For demo purposes, we'll create a simple check
      // In production, you'd verify against a real user database
      const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' },
        { username: 'demo', password: 'demo123' }
      ];

      const user = validCredentials.find(u => u.username === username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Username or password is incorrect'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          username: user.username,
          loginTime: new Date().toISOString()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          username: user.username
        },
        message: 'Login successful'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during login'
      });
    }
  },

  // User registration (for demo purposes)
  async register(req, res) {
    try {
      const { username, password, email } = req.body;

      // Simple validation
      if (!username || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Username and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 6 characters long'
        });
      }

      // In a real application, you'd save this to a database
      // For demo, we'll just return success
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          username
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during registration'
      });
    }
  },

  // User logout
  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token from localStorage
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during logout'
      });
    }
  }
};

module.exports = authController; 