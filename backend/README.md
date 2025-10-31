# MGNREGA Backend API

Backend API for "Our Voice, Our Rights" - MGNREGA Dashboard

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `DATA_GOV_API_KEY` - API key from data.gov.in
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

### 3. Seed Initial Data
```bash
npm run seed
```

### 4. Load Sample Data (for testing)
```bash
npm run sample
```

### 5. Start Server
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

## 📊 ETL Commands

### Automatic Scheduling (Production)
Start the scheduler for automatic data updates:
```bash
# Run scheduler in production
npm run scheduler

# Run scheduler in development (auto-restart)
npm run scheduler:dev
```

Schedule:
- **Full Sync**: Daily at 3:00 AM IST - All states
- **Incremental Sync**: Every hour - Subset of states

See [SCHEDULER.md](./SCHEDULER.md) for complete documentation.

### Manual ETL Runs

#### Full Sync (All States)
Fetches and normalizes data for all pan-India states:
```bash
npm run etl
```

#### Single State Sync
Fetch data for a specific state:
```bash
npm run etl:state "UTTAR PRADESH"
```

#### Incremental Sync
Quick sync for subset of states (for hourly updates):
```bash
npm run etl:incremental
```

## 🛣️ API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health and sync status |
| `/api/states` | GET | List all states |
| `/api/districts?state=STATE` | GET | Districts for a state |
| `/api/metrics/:district_code` | GET | Latest metrics for district |
| `/api/trends/:district_code?months=12` | GET | 12-month trend data |
| `/api/compare/:district_code` | GET | District vs state comparison |
| `/api/geolocate` | POST | GPS-based district detection |
| `/api/ip-location` | GET | IP-based district detection |

### Example Requests

```bash
# Get all states
curl http://localhost:5000/api/states

# Get districts in UP
curl http://localhost:5000/api/districts?state=UTTAR%20PRADESH

# Get metrics for a district
curl http://localhost:5000/api/metrics/0901

# Get 12-month trends
curl http://localhost:5000/api/trends/0901?months=12

# Get comparison
curl http://localhost:5000/api/compare/0901

# Health check
curl http://localhost:5000/api/health

# Auto-detect location from GPS coordinates
curl -X POST http://localhost:5000/api/geolocate \
  -H "Content-Type: application/json" \
  -d '{"lat": 28.6139, "lng": 77.2090}'

# Auto-detect location from IP address
curl http://localhost:5000/api/ip-location
```

See [LOCATION_API.md](./LOCATION_API.md) for complete location detection documentation.

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── District.js          # District schema
│   ├── DistrictMetric.js    # Metrics schema
│   ├── RawResponse.js       # Raw API response storage
│   └── SyncJob.js           # ETL job audit
├── routes/
│   ├── stateRoutes.js       # /api/states
│   ├── districtRoutes.js    # /api/districts
│   ├── metricRoutes.js      # /api/metrics
│   ├── trendRoutes.js       # /api/trends
│   ├── compareRoutes.js     # /api/compare
│   └── locationRoutes.js    # /api/geolocate, /api/ip-location
├── jobs/
│   ├── etl.js               # ETL worker
│   └── scheduler.js         # Automatic ETL scheduler
├── scripts/
│   ├── seedDistricts.js     # Seed pan-India states
│   └── loadSampleData.js    # Load test data
├── utils/
│   ├── apiFetcher.js        # API fetcher with retry
│   └── etlNormalizer.js     # Data normalizer
├── data/
│   └── sample-mgnrega.json  # Sample test data
└── server.js                # Express app
```

## 🔧 Development Workflow

1. **First Time Setup:**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run seed
   npm run sample
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Load Real Data:**
   ```bash
   # Single state for testing
   npm run etl:state "MADHYA PRADESH"
   
   # Full sync (takes time)
   npm run etl
   ```

## 🗄️ Database Collections

- **districts** - District master data
- **raw_responses** - Raw API responses (90-day TTL)
- **district_metrics** - Normalized MGNREGA metrics
- **sync_jobs** - ETL job audit trail

## ⚙️ Environment Variables

See `.env.example` for all available configuration options.

Notable options:
- `STALE_HOURS` — Number of hours after which district metrics are considered stale and a background refresh is triggered. Defaults to `96`. Cached data is still served immediately with `meta.stale=true` while the refresh runs.

## 🐛 Troubleshooting

**MongoDB connection fails:**
- Check `MONGODB_URI` format
- Ensure IP is whitelisted in MongoDB Atlas
- Verify network connectivity

**ETL fails:**
- Check `DATA_GOV_API_KEY` is valid
- Verify API endpoint is accessible
- Check logs for specific error messages

**API returns 404:**
- Ensure data is loaded (run `npm run sample` or `npm run etl`)
- Check district_code format matches DB

## 📝 License

MIT
