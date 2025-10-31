# 🌾 MGNREGA Dashboard — Our Voice, Our Rights

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-43853d.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6.svg)](https://www.typescriptlang.org/)

A **bilingual (Hindi/English) Progressive Web App** that empowers citizens to understand their district's MGNREGA performance through intuitive visualizations and smart location detection. Built for scale across all Indian states and territories.

## 🏗️ Architecture

This is a **full-stack MERN application** with automated ETL pipelines:

```
MGNREGA/
├── 🗄️ backend/          # Express API + ETL Workers + MongoDB Models
│   ├── 📊 models/       # District, DistrictMetric, RawResponse, SyncJob
│   ├── 🛣️ routes/        # stateRoutes, districtRoutes, metricRoutes, etc.
│   ├── ⚙️ jobs/         # etl.js (data fetcher), scheduler.js (cron jobs)
│   ├── 📜 scripts/      # seedDistricts.js, loadSampleData.js, addCentroids.js
│   ├── 🔧 utils/        # apiFetcher.js, etlNormalizer.js
│   └── 📡 server.js     # Express app with CORS, error handling, health check
├── 🎨 frontend/         # React + Vite + TypeScript PWA
│   ├── 🧩 components/   # MetricCard, LocationDetector, LanguageToggle, etc.
│   ├── 📄 pages/        # HomePage, DashboardPage (simplified single-page view)
│   ├── 🔗 services/     # api.ts (Axios service with interceptors)
│   ├── 🌐 i18n/         # English + Hindi translations
│   └── 📱 vite.config.ts # PWA configuration with Workbox caching
```

## ✨ Key Features

### 🎯 **Smart Location Detection**
- **IP-based geolocation** → **GPS consent prompt** → **Manual state/district selection**
- Supports all 34 Indian states and union territories
- Automatic fallback chain for maximum accessibility

### 📊 **Comprehensive Analytics**
- **Dashboard**: Current month metrics with inline comparison
- **District vs State**: Compare your district with state average and top performer
- **Key Metrics**: Person-days, wages disbursed, households worked, pending payments
- **Simple & Clear**: All information on one page, no complex navigation

### 🌍 **Accessibility & Inclusion**
- **Bilingual UI**: Complete Hindi + English support with `react-i18next`
- **Mobile-first design**: Responsive Tailwind CSS with 44px+ touch targets
- **PWA capabilities**: Offline support, installable app, background sync
- **Low-literacy friendly**: Large icons, simple language, audio readouts (planned)

### 🔄 **Resilient Data Pipeline**
- **Automated ETL**: Daily full sync + hourly incremental updates
- **Smart caching**: Multi-layer cache strategy (service worker + API cache)
- **Graceful degradation**: Shows last successful sync when APIs are down
- **Comprehensive monitoring**: Health endpoints + job audit trails

## 🚀 Tech Stack

### Backend (Node.js Ecosystem)
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "MongoDB Atlas (Mongoose ODM)",
  "scheduling": "node-cron",
  "data_source": "data.gov.in MGNREGA APIs",
  "deployment": "Render/Railway (recommended)"
}
```

### Frontend (Modern React Stack)
```json
{
  "framework": "React 19 + TypeScript 5.9",
  "build_tool": "Vite 7",
  "styling": "Tailwind CSS 4",
  "routing": "React Router v7",
  "i18n": "react-i18next",
  "http_client": "Axios",
  "pwa": "Vite PWA + Workbox",
  "deployment": "Vercel/Netlify (recommended)"
}
```

### Data Architecture
```json
{
  "collections": {
    "districts": "Master data for 700+ districts across India",
    "district_metrics": "Normalized MGNREGA performance data",
    "raw_responses": "API response cache (90-day TTL)",
    "sync_jobs": "ETL job audit and monitoring"
  },
  "indexes": "Optimized for district_code, state, year, month queries",
  "caching": "Redis-ready with file-cache fallback"
}
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB Atlas** account and connection URI
- **data.gov.in API key** (register at [data.gov.in](https://data.gov.in))

### 1️⃣ Backend Setup
```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
npm install

# Configure your .env file with:
# MONGODB_URI=mongodb+srv://...
# DATA_GOV_API_KEY=your_api_key
# FRONTEND_URL=http://localhost:5173

# Initialize database with pan-India districts
npm run seed

# Load sample data for testing
npm run sample

# Start development server
npm run dev                   # Runs on http://localhost:5000
```

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev                   # Runs on http://localhost:5173
```

### 3️⃣ ETL Data Pipeline (Optional)
```bash
# Run manual ETL to fetch live data
cd backend
npm run etl:state "UTTAR PRADESH"    # Single state
npm run etl                          # All states (takes time)

# Start automatic scheduler for production
npm run scheduler
```

Visit **http://localhost:5173** to see the dashboard!

## 📡 API Reference

### Core Endpoints
```http
GET /api/health                      # System status & sync info
GET /api/states                      # List all states
GET /api/districts?state=STATE_NAME  # Districts for a state
GET /api/metrics/:district_code      # Latest metrics for district
GET /api/compare/:district_code      # District vs state comparison
```

### Location Detection
```http
GET /api/ip-location                 # Auto-detect from IP
POST /api/geolocate                  # GPS coordinates to district
Content-Type: application/json
{
  "lat": 28.6139,
  "lng": 77.2090
}
```

### Example Response
```json
{
  "data": {
    "district_code": "0901",
    "state": "UTTAR PRADESH",
    "district_name": "MUZAFFARNAGAR",
    "year": 2024,
    "month": 10,
    "total_households_worked": 45234,
    "total_persondays_generated": 892456,
    "total_wage_disbursed": 28736582.50,
    "pending_payments": 1245678.25,
    "last_updated": "2024-10-30T12:00:00.000Z"
  },
  "meta": {
    "last_updated": "2024-10-30T12:00:00.000Z",
    "stale": false
  }
}
```

## 🔧 Advanced Configuration

### Backend Environment Variables
```bash
# Core Configuration
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mgnrega
FRONTEND_URL=http://localhost:5173

# Data Sources
DATA_GOV_API_KEY=your_data_gov_in_api_key
API_BASE_URL=https://api.data.gov.in/resource/

# ETL Scheduling (Production)
ENABLE_CRON_JOBS=true
FULL_SYNC_CRON="0 3 * * *"        # Daily at 3 AM IST
HOURLY_SYNC_CRON="0 * * * *"      # Every hour
RUN_ON_STARTUP=false

# Optional: Redis Caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional_password
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Optional: Analytics & Monitoring
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://sentry.io/dsn
```

### MongoDB Collections Schema

#### Districts Collection
```javascript
{
  _id: ObjectId,
  state: "UTTAR PRADESH",
  state_code: "UP",
  district_code: "0901",
  district_name: "MUZAFFARNAGAR", 
  centroid: { lat: 29.4727, lng: 77.7085 },
  aliases: ["MUZAFFARNAGAR", "MUZZAFARNAGAR"],
  createdAt: Date,
  updatedAt: Date
}
```

#### District Metrics Collection
```javascript
{
  _id: ObjectId,
  district_code: "0901",
  state: "UTTAR PRADESH",
  year: 2024,
  month: 10,
  total_households_worked: 45234,
  total_persondays_generated: 892456,
  total_wage_disbursed: 28736582.50,
  pending_payments: 1245678.25,
  other_metrics: { /* Additional fields */ },
  last_updated: Date,
  source_raw_id: ObjectId,  // Reference to raw_responses
  stale: false
}
```

## 🚦 Development Workflow

### Available Scripts

#### Backend Scripts
```bash
npm run dev            # Development with nodemon
npm run start          # Production server
npm run seed           # Seed pan-India districts
npm run sample         # Load sample test data
npm run add-centroids  # Add GPS coordinates to districts

# ETL Commands
npm run etl                    # Full sync (all states)
npm run etl:state "STATE"      # Single state sync
npm run etl:incremental        # Quick sync (hot states only)

# Production Scheduling
npm run scheduler              # Start cron jobs
npm run scheduler:dev          # Development scheduler with auto-restart
```

#### Frontend Scripts
```bash
npm run dev            # Development server (Vite HMR)
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # ESLint code checking
```

### Testing Strategy
```bash
# Backend API Testing
curl http://localhost:5000/api/health
curl http://localhost:5000/api/states
curl "http://localhost:5000/api/districts?state=UTTAR%20PRADESH"

# Frontend Testing
# Open http://localhost:5173
# Test location detection
# Test offline mode (Network tab → Offline)
# Test language toggle (Hindi ↔ English)
```

## 🌐 Deployment

### Production Deployment

#### Backend (Render/Railway)
```yaml
# render.yaml or similar
services:
  - type: web
    name: mgnrega-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase: # Your MongoDB Atlas URI
      - key: DATA_GOV_API_KEY
        fromSecret: # Your API key
      - key: ENABLE_CRON_JOBS
        value: "true"
```

#### Frontend (Vercel/Netlify)
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-domain.com"
  }
}
```

### Environment-Specific Configurations

#### Development
- Hot module replacement with Vite
- CORS enabled for localhost
- Detailed error messages
- Sample data pre-loaded

#### Production
- Minified assets with tree-shaking
- Service worker enabled
- Error tracking with Sentry (optional)
- CDN optimization
- Rate limiting enabled

## 📊 Monitoring & Health Checks

### Health Endpoint Response
```json
{
  "status": "ok",
  "timestamp": "2024-10-30T19:51:28.638Z",
  "database": "connected",
  "last_full_sync": "2024-10-30T03:00:00.000Z",
  "last_hourly_sync": "2024-10-30T19:00:00.000Z",
  "last_error": null,
  "queue_depth": 0
}
```

### ETL Job Monitoring
```bash
# Check recent sync jobs
curl http://localhost:5000/api/health

# Monitor logs in production
tail -f logs/etl.log

# Manual health check
npm run etl:state "BIHAR"  # Should complete without errors
```

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string format
# Test connection:
node -e "require('./backend/config/database')()"
```

#### ETL Failures
```bash
# Check API key validity
curl "https://api.data.gov.in/resource/test?api-key=YOUR_KEY"

# Check rate limits
# Verify state names match exactly (uppercase)
# Review error logs in sync_jobs collection
```

#### Frontend Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npm run build

# Verify environment variables
echo $VITE_API_URL
```

#### CORS Errors
```bash
# Ensure FRONTEND_URL matches exactly
# Check for trailing slashes
# Verify protocol (http vs https)
```

## 📚 Additional Resources

- **[Backend API Docs](./backend/README.md)** - Full API reference and ETL details  
- **[Frontend Guide](./frontend/README.md)** - UI components and PWA features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style and patterns
4. Test thoroughly with both frontend and backend
5. Submit a pull request with clear description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built for Build For Bharat Fellowship 2026** 🇮🇳  
*Empowering citizens through transparent governance data*