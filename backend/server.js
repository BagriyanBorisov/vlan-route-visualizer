const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import routes
const switchRoutes = require('./routes/switches');
const vlanRoutes = require('./routes/vlans');
const authRoutes = require('./routes/auth');

// Import database
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/switches', switchRoutes);
app.use('/api/vlans', vlanRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VLAN Route Visualizer API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.details;
  }

  // Database errors
  if (err.code && err.code.startsWith('SQLITE_')) {
    error.message = 'Database Error';
    error.status = 500;
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { details: err.message, stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Initialize database tables
    await database.initializeTables();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API Documentation available at http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: SQLite`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await database.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await database.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer(); 