const express = require('express');
const District = require('../models/District');

const router = express.Router();

/**
 * GET /api/states
 * Returns list of all states with state codes
 * Cache: 24h (as per RPD section 8)
 */
router.get('/states', async (req, res) => {
  try {
    // Aggregate to get unique states
    const states = await District.aggregate([
      {
        $group: {
          _id: '$state',
          state_code: { $first: '$state_code' },
          district_count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          state: '$_id',
          state_code: 1,
          district_count: 1
        }
      },
      {
        $sort: { state: 1 }
      }
    ]);

    // Set cache headers (24 hours)
    res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    
    res.json({
      success: true,
      count: states.length,
      data: states,
      meta: {
        timestamp: new Date().toISOString(),
        cached_until: new Date(Date.now() + 86400000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch states',
      message: error.message
    });
  }
});

module.exports = router;
