import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n';
import Header from './components/Header';
import OfflineBanner from './components/OfflineBanner';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TrendsPage from './pages/TrendsPage';
import ComparePage from './pages/ComparePage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <OfflineBanner />
        <Header />
          <main className="pt-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/district/:code" element={<DashboardPage />} />
            <Route path="/district/:code/trends" element={<TrendsPage />} />
            <Route path="/district/:code/compare" element={<ComparePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
