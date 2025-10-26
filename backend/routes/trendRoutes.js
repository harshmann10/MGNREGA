const express = require('express');
const DistrictMetric = require('../models/DistrictMetric');
const District = require('../models/District');

const router = express.Router();

/**
 * GET /api/trends/:district_code?months=12
 * Returns historical trend data for past N months
 * Cache: 15m (as per RPD section 8)
 */
router.get('/trends/:district_code', async (req, res) => {
  try {
    const { district_code } = req.params;
    const months = parseInt(req.query.months) || 12;

    // Validate months parameter
    if (months < 1 || months > 24) {
      return res.status(400).json({
        success: false,
        error: 'Months parameter must be between 1 and 24'
      });
    }

    // Verify district exists
    const district = await District.findOne({ district_code });
    if (!district) {
      return res.status(404).json({
        success: false,
        error: 'District not found',
        district_code
      });
    }

    // Use the static method from model
    const trends = await DistrictMetric.findTrends(district_code, months);

    if (trends.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No trend data found for this district',
        district_code
      });
    }

    // Format the response
    const formattedTrends = trends.map(metric => ({
      year: metric.year,
      month: metric.month,
      date: `${metric.year}-${String(metric.month).padStart(2, '0')}`,
      total_households_worked: metric.total_households_worked,
      total_persondays_generated: metric.total_persondays_generated,
      total_wage_disbursed: metric.total_wage_disbursed,
      pending_payments: metric.pending_payments,
      last_updated: metric.last_updated
    }));

    // Set cache headers (15 minutes)
    res.set('Cache-Control', 'public, max-age=300, s-maxage=900');

    res.json({
      success: true,
      district_code,
      district_name: district.district_name,
      state: district.state,
      period: {
        months_requested: months,
        records_found: trends.length,
        oldest: formattedTrends[0]?.date,
        newest: formattedTrends[formattedTrends.length - 1]?.date
      },
      data: formattedTrends,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

module.exports = router;
