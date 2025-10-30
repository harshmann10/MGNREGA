import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import type { StateInfo, District } from '../types';

export default function DistrictSelector() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [states, setStates] = useState<StateInfo[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await apiService.getStates();
        setStates(data);
      } catch (error) {
        console.error('Failed to fetch states:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await apiService.getDistricts(selectedState);
        setDistricts(data);
      } catch (error) {
        console.error('Failed to fetch districts:', error);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedState]);

  const handleDistrictSelect = () => {
    if (!selectedDistrict) return;

    const district = districts.find((d) => d.district_code === selectedDistrict);
    if (district) {
      navigate(`/district/${selectedDistrict}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="state" className="block text-lg font-bold text-gray-800 mb-3">
          {t('select_state')}
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict('');
          }}
          className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white font-medium"
        >
          <option value="">{t('choose_state')}</option>
          {states.map((state) => (
            <option key={state.state_code} value={state.state}>
              {state.state}
            </option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div>
          <label htmlFor="district" className="block text-lg font-bold text-gray-800 mb-3">
            {t('select_district')}
          </label>
          {loadingDistricts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white font-medium"
            >
              <option value="">{t('choose_district')}</option>
              {districts.map((district) => (
                <option key={district.district_code} value={district.district_code}>
                  {district.district_name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <button
        onClick={handleDistrictSelect}
        disabled={!selectedDistrict}
        className={`w-full touch-target px-8 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
          selectedDistrict
            ? 'bg-linear-to-r from-blue-600 to-green-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {selectedDistrict ? '✅ ' : '📍 '}{t('view_dashboard')}
      </button>
    </div>
  );
}
