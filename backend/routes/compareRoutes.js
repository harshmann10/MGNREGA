const express = require('express');
const DistrictMetric = require('../models/DistrictMetric');
const District = require('../models/District');

const router = express.Router();

/**
 * GET /api/compare/:district_code
 * Returns district metrics vs state average and top performing district
 * Cache: 15m (as per RPD section 8)
 */
router.get('/compare/:district_code', async (req, res) => {
  try {
    const { district_code } = req.params;

    // Verify district exists
    const district = await District.findOne({ district_code });
    if (!district) {
      return res.status(404).json({
        success: false,
        error: 'District not found',
        district_code
      });
    }

    // Get latest metrics for this district
    const districtMetrics = await DistrictMetric.findOne({ district_code })
      .sort({ year: -1, month: -1 });

    if (!districtMetrics) {
      return res.status(404).json({
        success: false,
        error: 'No metrics found for this district',
        district_code
      });
    }

    const { state, year, month } = districtMetrics;

    // Get state average using the static method
    const stateAverage = await DistrictMetric.getStateAverage(state, year, month);

    // Find top performing district in the state
    const topDistrict = await DistrictMetric.findOne({
      state,
      year,
      month
    })
      .sort({ total_persondays_generated: -1 })
      .populate('district_code', 'district_name');

    // Get top district details
    const topDistrictInfo = topDistrict 
      ? await District.findOne({ district_code: topDistrict.district_code })
      : null;

    // Set cache headers (15 minutes)
    res.set('Cache-Control', 'public, max-age=300, s-maxage=900');

    res.json({
      success: true,
      period: { year, month },
      comparison: {
        district: {
          district_code,
          district_name: district.district_name,
          state,
          metrics: {
            total_households_worked: districtMetrics.total_households_worked,
            total_persondays_generated: districtMetrics.total_persondays_generated,
            total_wage_disbursed: districtMetrics.total_wage_disbursed,
            pending_payments: districtMetrics.pending_payments
          }
        },
        state_average: stateAverage ? {
          avg_households: Math.round(stateAverage.avg_households),
          avg_persondays: Math.round(stateAverage.avg_persondays),
          avg_wages: Math.round(stateAverage.avg_wages),
          avg_pending: Math.round(stateAverage.avg_pending)
        } : null,
        top_district: topDistrictInfo ? {
          district_code: topDistrict.district_code,
          district_name: topDistrictInfo.district_name,
          metrics: {
            total_households_worked: topDistrict.total_households_worked,
            total_persondays_generated: topDistrict.total_persondays_generated,
            total_wage_disbursed: topDistrict.total_wage_disbursed,
            pending_payments: topDistrict.pending_payments
          }
        } : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        last_updated: districtMetrics.last_updated
      }
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comparison data',
      message: error.message
    });
  }
});

module.exports = router;
