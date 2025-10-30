require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const SyncJob = require('./models/SyncJob');

// Import routes
const stateRoutes = require('./routes/stateRoutes');
const districtRoutes = require('./routes/districtRoutes');
const metricRoutes = require('./routes/metricRoutes');
const trendRoutes = require('./routes/trendRoutes');
const compareRoutes = require('./routes/compareRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Import scheduler
const { startScheduler } = require('./jobs/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', stateRoutes);
app.use('/api', districtRoutes);
app.use('/api', metricRoutes); // Now with cache-first + lazy refresh
app.use('/api', trendRoutes);
app.use('/api', compareRoutes);
app.use('/api', locationRoutes);

// Health check endpoint (as per RPD section 8)
app.get('/api/health', async (req, res) => {
  try {
    const lastFullSync = await SyncJob.findLastSuccess('full');
    const lastHourlySync = await SyncJob.findLastSuccess('hourly');
    const runningJobs = await SyncJob.findRunning();
    const lastError = await SyncJob.findOne({ status: 'failed' })
      .sort({ start_time: -1 })
      .select('job_type start_time errors');

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      last_full_sync: lastFullSync ? lastFullSync.start_time : null,
      last_hourly_sync: lastHourlySync ? lastHourlySync.start_time : null,
      last_error: lastError ? {
        job_type: lastError.job_type,
        time: lastError.start_time,
        errors: lastError.errors
      } : null,
      queue_depth: runningJobs.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Our Voice, Our Rights - MGNREGA API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      states: '/api/states',
      districts: '/api/districts?state=STATE_NAME',
      metrics: '/api/metrics/:district_code',
      trends: '/api/trends/:district_code?months=12',
      compare: '/api/compare/:district_code',
      geolocate: '/api/geolocate (POST)',
      ip_location: '/api/ip-location'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start the scheduler after database connection
    if (process.env.ENABLE_CRON_JOBS !== 'false') {
      await startScheduler();
    } else {
      console.log('⚠️  Cron jobs are disabled (ENABLE_CRON_JOBS=false)');
    }
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
