const express = require('express');
const DistrictMetric = require('../models/DistrictMetric');
const District = require('../models/District');

const router = express.Router();

/**
 * GET /api/metrics/:district_code?year=YYYY&month=M
 * Returns metrics for a district (latest or specific year/month)
 * Cache: 5-15m (as per RPD section 8)
 */
router.get('/metrics/:district_code', async (req, res) => {
  try {
    const { district_code } = req.params;
    const { year, month } = req.query;

    // Verify district exists
    const district = await District.findOne({ district_code });
    if (!district) {
      return res.status(404).json({
        success: false,
        error: 'District not found',
        district_code
      });
    }

    let metrics;
    let query = { district_code };

    // If year and month provided, get specific metric
    if (year && month) {
      query.year = parseInt(year);
      query.month = parseInt(month);
      metrics = await DistrictMetric.findOne(query);
    } else {
      // Get latest metric
      metrics = await DistrictMetric.findOne({ district_code })
        .sort({ year: -1, month: -1 });
    }

    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'No metrics found for this district',
        district_code,
        ...(year && month && { year: parseInt(year), month: parseInt(month) })
      });
    }

    // Check if data is stale (older than 36 hours)
    const hoursSinceUpdate = (Date.now() - metrics.last_updated) / (1000 * 60 * 60);
    const isStale = hoursSinceUpdate > 36 || metrics.stale;

    // Set cache headers (15 minutes)
    res.set('Cache-Control', 'public, max-age=300, s-maxage=900');

    res.json({
      success: true,
      data: {
        district_code: metrics.district_code,
        district_name: district.district_name,
        state: metrics.state,
        year: metrics.year,
        month: metrics.month,
        metrics: {
          total_households_worked: metrics.total_households_worked,
          total_persondays_generated: metrics.total_persondays_generated,
          total_wage_disbursed: metrics.total_wage_disbursed,
          pending_payments: metrics.pending_payments,
          ...metrics.other_metrics
        }
      },
      meta: {
        last_updated: metrics.last_updated,
        stale: isStale,
        hours_since_update: Math.round(hoursSinceUpdate),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

module.exports = router;
