const express = require('express');
const District = require('../models/District');

const router = express.Router();

/**
 * POST /api/geolocate
 * Reverse geocode GPS coordinates to nearest district
 */
router.post('/geolocate', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Find nearest district using centroid
    // Exclude state-level districts (usually end with 00)
    const districts = await District.find({ 
      'centroid.lat': { $exists: true },
      'centroid.lng': { $exists: true },
      district_name: { $not: /STATE LEVEL/i }
    });

    if (districts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No districts with coordinates found'
      });
    }

    // Calculate distances
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const districtsWithDistance = districts.map(district => ({
      ...district.toObject(),
      distance: getDistance(
        parseFloat(lat),
        parseFloat(lng),
        district.centroid.lat,
        district.centroid.lng
      )
    }));

    // Sort by distance and get closest
    districtsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearest = districtsWithDistance[0];

    res.json({
      success: true,
      district_code: nearest.district_code,
      district_name: nearest.district_name,
      state: nearest.state,
      distance_km: Math.round(nearest.distance),
      detected_by: 'gps'
    });

  } catch (error) {
    console.error('Geolocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect district from coordinates',
      message: error.message
    });
  }
});

/**
 * GET /api/ip-location
 * Detect location using IP address (fallback)
 * Uses ipapi.co free tier (no API key needed for basic usage)
 */
router.get('/ip-location', async (req, res) => {
  try {
    // Get client IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress;

    console.log('Client IP:', clientIP);

    // For localhost/development, return a default location
    if (!clientIP || clientIP === '::1' || clientIP === '127.0.0.1' || clientIP.includes('192.168')) {
      console.log('Local IP detected, returning default district');
      
      // Return first available district as fallback (exclude state-level)
      const defaultDistrict = await District.findOne({
        district_name: { $not: /STATE LEVEL/i }
      }).limit(1);
      
      if (defaultDistrict) {
        return res.json({
          success: true,
          district_code: defaultDistrict.district_code,
          district_name: defaultDistrict.district_name,
          state: defaultDistrict.state,
          detected_by: 'ip',
          note: 'Default district (localhost detected)'
        });
      }
    }

    // Try to get location from IP using ipapi.co
    const ipApiResponse = await fetch(`https://ipapi.co/${clientIP}/json/`);
    
    if (!ipApiResponse.ok) {
      throw new Error('IP geolocation service unavailable');
    }

    const ipData = await ipApiResponse.json();
    
    if (!ipData.latitude || !ipData.longitude) {
      throw new Error('Could not determine coordinates from IP');
    }

    console.log('IP Location:', ipData.city, ipData.region, ipData.country_code);

    // Find nearest district to IP coordinates
    // Exclude state-level districts
    const districts = await District.find({ 
      'centroid.lat': { $exists: true },
      'centroid.lng': { $exists: true },
      district_name: { $not: /STATE LEVEL/i }
    });

    if (districts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No districts with coordinates found'
      });
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const districtsWithDistance = districts.map(district => ({
      ...district.toObject(),
      distance: getDistance(
        ipData.latitude,
        ipData.longitude,
        district.centroid.lat,
        district.centroid.lng
      )
    }));

    districtsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearest = districtsWithDistance[0];

    res.json({
      success: true,
      district_code: nearest.district_code,
      district_name: nearest.district_name,
      state: nearest.state,
      distance_km: Math.round(nearest.distance),
      detected_by: 'ip',
      ip_location: {
        city: ipData.city,
        region: ipData.region,
        country: ipData.country_code
      }
    });

  } catch (error) {
    console.error('IP location error:', error);
    
    // Fallback: return first available district
    try {
      const defaultDistrict = await District.findOne({
        district_name: { $not: /STATE LEVEL/i }
      }).limit(1);
      
      if (defaultDistrict) {
        return res.json({
          success: true,
          district_code: defaultDistrict.district_code,
          district_name: defaultDistrict.district_name,
          state: defaultDistrict.state,
          detected_by: 'ip',
          note: 'Fallback to default district'
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to detect location from IP',
      message: error.message
    });
  }
});

module.exports = router;
