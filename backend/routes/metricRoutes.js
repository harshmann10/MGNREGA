const express = require('express');
const DistrictMetric = require('../models/DistrictMetric');
const District = require('../models/District');
const apiFetcher = require('../utils/apiFetcher');
const etlNormalizer = require('../utils/etlNormalizer');
const RawResponse = require('../models/RawResponse');

const router = express.Router();

// Track ongoing background refreshes to avoid duplicates
const refreshQueue = new Set();

/**
 * GET /api/metrics/:district_code
 * Returns latest metrics for a district
 * Cache: 5-15m (as per RPD section 8)
 */
router.get('/metrics/:district_code', async (req, res) => {
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

    // Get latest metric
    const metrics = await DistrictMetric.findOne({ district_code })
      .sort({ year: -1, month: -1 });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'No metrics found for this district',
        district_code
      });
    }

    // Check if data is stale (older than configured threshold)
    // Make threshold configurable via env (default: 96 hours)
    const STALE_HOURS = Number(process.env.STALE_HOURS || 96);
    const hoursSinceUpdate = (Date.now() - metrics.last_updated) / (1000 * 60 * 60);
    const isStale = hoursSinceUpdate > STALE_HOURS || metrics.stale;

    // Lazy refresh: If stale, trigger background refresh (non-blocking)
    let refreshKey;
    let refreshTriggered = false;
    if (isStale) {
      refreshKey = `${district.state}-${district_code}`;
      if (!refreshQueue.has(refreshKey)) {
        refreshQueue.add(refreshKey);
        refreshTriggered = true;
        console.log(`🔄 Lazy refresh triggered for ${district.district_name} (${Math.round(hoursSinceUpdate)}h old; threshold ${STALE_HOURS}h)`);

        // Fire-and-forget background refresh
        refreshStateInBackground(district.state, refreshKey)
          .catch(err => {
            console.error(`❌ Background refresh failed for ${district.state}:`, err.message);
          });
      }
    }

    // Set cache headers (15 minutes)
    res.set('Cache-Control', 'public, max-age=300, s-maxage=900');

    res.json({
      success: true,
      data: {
        _id: metrics._id,
        district_code: metrics.district_code,
        district_name: district.district_name,
        state: metrics.state,
        year: metrics.year,
        month: metrics.month,
        total_households_worked: metrics.total_households_worked,
        total_persondays_generated: metrics.total_persondays_generated,
        total_wage_disbursed: metrics.total_wage_disbursed,
        pending_payments: metrics.pending_payments,
        other_metrics: metrics.other_metrics || {},
        last_updated: metrics.last_updated,
        source_raw_id: metrics.source_raw_id,
        stale: metrics.stale
      },
      meta: {
        last_updated: metrics.last_updated,
        stale: isStale,
        stale_threshold_hours: STALE_HOURS,
        hours_since_update: Math.round(hoursSinceUpdate),
        refresh_triggered: refreshTriggered,
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

/**
 * Background refresh function
 * Fetches fresh data for entire state and updates cache
 */
async function refreshStateInBackground(state, refreshKey) {
  try {
    console.log(`🔄 Background refresh started for ${state}`);
    
    // Fetch fresh data from API
    const result = await apiFetcher.fetchAllStateRecords(state, '2024-2025');
    
    if (!result.success) {
      console.error(`❌ API fetch failed for ${state}: ${result.error}`);
      return;
    }

    // Save raw response summary
    const rawDataSummary = {
      total_records: result.records.length,
      sample_record: result.records[0],
      fetched_at: new Date(),
      state: state,
      fin_year: '2024-2025',
      trigger: 'lazy_refresh'
    };
    
    const rawResponse = await RawResponse.create({
      endpoint: apiFetcher.buildURL({ state_name: state, fin_year: '2024-2025' }),
      fetch_time: new Date(),
      state: state,
      raw_data: rawDataSummary,
      status: 'success',
      response_size_bytes: JSON.stringify(rawDataSummary).length
    });

    // Ensure districts exist
    await etlNormalizer.ensureDistrictsExist(result);

    // Normalize and save metrics
    const processResult = await etlNormalizer.processAndSave(
      result,
      rawResponse.endpoint,
      state,
      rawResponse._id
    );

    console.log(`✅ Background refresh completed for ${state}: ${processResult.saved + processResult.updated} metrics updated`);
    
  } catch (error) {
    console.error(`❌ Background refresh error for ${state}:`, error.message);
  } finally {
    // Remove from queue
    refreshQueue.delete(refreshKey);
  }
}

module.exports = router;
