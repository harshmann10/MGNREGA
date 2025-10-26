import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DistrictSelector from './DistrictSelector';

export default function LocationDetector() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // Try GPS first
      if ('geolocation' in navigator) {
        const permission = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 0,
          });
        });

        // Send coordinates to backend for reverse geocoding
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/geolocate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: permission.coords.latitude,
              lng: permission.coords.longitude,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.district_code) {
            navigate(`/district/${data.district_code}`);
            return;
          }
        }
      }

      // Fallback to IP-based detection
      const ipResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ip-location`
      );

      if (ipResponse.ok) {
        const data = await ipResponse.json();
        if (data.district_code) {
          navigate(`/district/${data.district_code}`);
          return;
        }
      }

      // If both fail, show manual selector
      setError(t('auto_detect_failed'));
      setShowManual(true);
    } catch (err) {
      console.error('Location detection failed:', err);
      setError(t('auto_detect_failed'));
      setShowManual(true);
    } finally {
      setIsDetecting(false);
    }
  };

  if (showManual) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            {error}
          </div>
        )}
        <DistrictSelector />
      </div>
    );
  }

  if (isDetecting) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">{t('detecting_location')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={detectLocation}
        className="w-full touch-target px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
      >
        <span className="text-2xl">📍</span>
        <span>{t('auto_detect_location')}</span>
      </button>

      <div className="text-center">
        <span className="text-gray-500">{t('or')}</span>
      </div>

      <button
        onClick={() => setShowManual(true)}
        className="w-full touch-target px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        {t('select_manually')}
      </button>
    </div>
  );
}
