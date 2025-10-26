const express = require('express');
const District = require('../models/District');

const router = express.Router();

/**
 * GET /api/districts?state=STATE_NAME
 * Returns list of districts for a given state
 * Cache: 24h (as per RPD section 8)
 */
router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'State parameter is required',
        example: '/api/districts?state=UTTAR PRADESH'
      });
    }

    // Find all districts for the state
    const districts = await District.find(
      { state: state.toUpperCase() },
      { district_code: 1, district_name: 1, centroid: 1, _id: 0 }
    ).sort({ district_name: 1 });

    if (districts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No districts found for this state',
        state: state.toUpperCase()
      });
    }

    // Set cache headers (24 hours)
    res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    res.json({
      success: true,
      state: state.toUpperCase(),
      count: districts.length,
      data: districts,
      meta: {
        timestamp: new Date().toISOString(),
        cached_until: new Date(Date.now() + 86400000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch districts',
      message: error.message
    });
  }
});

module.exports = router;
