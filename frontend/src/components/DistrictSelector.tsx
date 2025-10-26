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
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Generate financial year options (current FY and 2 years back)
  const getFinancialYearLabel = (year: number) => {
    const nextYear = year + 1;
    return `${year}-${nextYear.toString().slice(-2)}`;
  };
  
  const financialYearOptions = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

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
      // Navigate with year parameter
      navigate(`/district/${selectedDistrict}?year=${selectedYear}`);
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
    <div className="space-y-4">
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
          {t('select_state')}
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict('');
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">{t('choose_state')}</option>
          {states.map((state) => (
            <option key={state.state_code} value={state.state}>
              {state.state} ({state.district_count} {t('districts')})
            </option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
            {t('select_district')}
          </label>
          {loadingDistricts ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

      {selectedDistrict && (
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            {t('select_year')}
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {financialYearOptions.map((year) => (
              <option key={year} value={year}>
                {getFinancialYearLabel(year)}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleDistrictSelect}
        disabled={!selectedDistrict}
        className={`w-full touch-target px-6 py-3 rounded-lg font-medium transition-colors ${
          selectedDistrict
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {t('view_dashboard')}
      </button>
    </div>
  );
}
