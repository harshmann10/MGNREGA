# MGNREGA Dashboard - Frontend

React + Vite + TypeScript frontend for the MGNREGA district performance dashboard.

## Features

- 🌐 Bilingual support (English + Hindi)
- 📱 Mobile-first responsive design
- 📊 Interactive dashboards and charts
- 🔄 Offline support with service workers
- 🎯 Auto-detection of user's district
- ♿ Accessibility-focused (WCAG 2.1 AA)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Install runtime dependencies
npm install react-router-dom axios react-i18next i18next workbox-window

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa

# Install all dependencies at once
npm install
```

### Environment Setup

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   └── LanguageToggle.tsx
├── pages/              # Route components
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── TrendsPage.tsx
│   ├── ComparePage.tsx
│   └── AboutPage.tsx
├── services/           # API service layer
│   └── api.ts
├── i18n/              # Internationalization
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       └── hi.json
├── types/             # TypeScript types
│   └── index.ts
├── utils/             # Helper functions
├── context/           # React Context providers
└── App.tsx            # Main app component
```

## Routes

- `/` - Home page with district selection
- `/district/:code` - District dashboard
- `/district/:code/trends` - 12-month trend charts
- `/district/:code/compare` - Comparison with state average
- `/about` - About page

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **i18n**: react-i18next
- **HTTP Client**: Axios
- **PWA**: vite-plugin-pwa + Workbox

## API Integration

The frontend connects to the backend API at `VITE_API_URL`. Key endpoints:

- `GET /api/states` - List of states
- `GET /api/districts?state=STATE` - Districts by state
- `GET /api/metrics/:code` - District metrics
- `GET /api/trends/:code?months=12` - Trend data
- `GET /api/compare/:code` - Comparison data
- `GET /api/health` - Backend health status

## Development Workflow

1. **Start Backend**: Ensure backend is running on port 5000
2. **Start Frontend**: `npm run dev` (runs on port 5173)
3. **Make Changes**: Hot module replacement enabled
4. **Test**: Open http://localhost:5173

## Building for Production

```bash
# Build
npm run build

# Preview
npm run preview
```

Output will be in `dist/` folder.

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deploy

1. Build: `npm run build`
2. Upload `dist/` folder to static hosting
3. Set environment variable `VITE_API_URL` to production API

## Accessibility Features

- ARIA labels on all interactive elements
- Keyboard navigation support
- High contrast colors
- Minimum 44px touch targets
- Screen reader friendly
- Font sizes 16px+ base

## Internationalization

Add new language:

1. Create `src/i18n/locales/{lang}.json`
2. Import in `src/i18n/index.ts`
3. Add to resources object

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### Port already in use

```bash
# Kill process on port 5173
npx kill-port 5173
```

### API connection failed

- Check `.env.local` has correct `VITE_API_URL`
- Ensure backend is running
- Check CORS settings in backend

### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## License

Built for Build For Bharat Fellowship 2026
