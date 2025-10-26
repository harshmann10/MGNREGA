require('dotenv').config();
const connectDatabase = require('../config/database');
const apiFetcher = require('../utils/apiFetcher');
const etlNormalizer = require('../utils/etlNormalizer');
const RawResponse = require('../models/RawResponse');
const SyncJob = require('../models/SyncJob');

/**
 * Main ETL Worker
 * Fetches data from data.gov.in and normalizes to district_metrics
 * As per RPD section 7: Daily full sync + hourly incremental
 */

// States to sync (from RPD section 1)
const STATES = [
  'UTTAR PRADESH', 'MADHYA PRADESH', 'BIHAR', 'ASSAM', 'MAHARASHTRA', 
  'GUJARAT', 'RAJASTHAN', 'TAMIL NADU', 'CHHATTISGARH', 'KARNATAKA',
  'TELANGANA', 'ODISHA', 'ANDHRA PRADESH', 'PUNJAB', 'JHARKHAND',
  'HARYANA', 'ARUNACHAL PRADESH', 'JAMMU AND KASHMIR', 'MANIPUR',
  'UTTARAKHAND', 'KERALA', 'HIMACHAL PRADESH', 'MEGHALAYA', 'WEST BENGAL',
  'MIZORAM', 'NAGALAND', 'TRIPURA', 'SIKKIM', 'ANDAMAN AND NICOBAR',
  'LADAKH', 'PUDUCHERRY', 'GOA', 'DN HAVELI AND DD', 'LAKSHADWEEP'
];

/**
 * Sync data for a single state
 */
async function syncState(stateName, finYear = '2024-2025', syncJob) {
  console.log(`\n📍 Syncing ${stateName}...`);
  
  try {
    // Fetch data from API
    const result = await apiFetcher.fetchAllStateRecords(stateName, finYear);
    
    if (!result.success) {
      await syncJob.addError(`Failed to fetch ${stateName}: ${result.error}`, result.code);
      return { state: stateName, success: false, error: result.error };
    }

    // Save raw response
    const rawResponse = await RawResponse.create({
      endpoint: apiFetcher.buildURL({ state_name: stateName, fin_year: finYear }),
      fetch_time: new Date(),
      state: stateName,
      raw_data: result,
      status: 'success',
      response_size_bytes: JSON.stringify(result).length
    });

    console.log(`💾 Saved raw response for ${stateName} (${result.records.length} records)`);

    // Ensure districts exist
    const districtResult = await etlNormalizer.ensureDistrictsExist(result);
    console.log(`📊 Districts - Created: ${districtResult.created.length}, Existing: ${districtResult.existing.length}`);

    // Normalize and save metrics
    const processResult = await etlNormalizer.processAndSave(
      result,
      rawResponse.endpoint,
      stateName,
      rawResponse._id
    );

    console.log(`✅ ${stateName} - Saved/Updated: ${processResult.saved + processResult.updated}, Errors: ${processResult.errors.length}`);

    return {
      state: stateName,
      success: true,
      records: result.records.length,
      metrics_saved: processResult.saved + processResult.updated,
      errors: processResult.errors.length
    };

  } catch (error) {
    console.error(`❌ Error syncing ${stateName}:`, error.message);
    await syncJob.addError(`Error syncing ${stateName}: ${error.message}`);
    
    // Try to save failed raw response
    try {
      await RawResponse.create({
        endpoint: apiFetcher.buildURL({ state_name: stateName }),
        fetch_time: new Date(),
        state: stateName,
        raw_data: {},
        status: 'failed',
        error_message: error.message
      });
    } catch (saveError) {
      console.error('Failed to save error response:', saveError.message);
    }

    return { state: stateName, success: false, error: error.message };
  }
}

/**
 * Full sync job - sync all states
 */
async function runFullSync(statesToSync = null) {
  console.log('\n🚀 Starting FULL SYNC job...\n');
  
  const syncJob = await SyncJob.create({
    job_type: 'full',
    start_time: new Date(),
    status: 'running'
  });

  const states = statesToSync || STATES;
  const results = [];
  let totalRecords = 0;

  for (const state of states) {
    const result = await syncState(state, '2024-2025', syncJob);
    results.push(result);
    
    if (result.success) {
      totalRecords += result.records || 0;
    }

    // Small delay between states to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n✅ FULL SYNC COMPLETE`);
  console.log(`   States: ${successful}/${states.length} successful`);
  console.log(`   Total records: ${totalRecords}`);
  if (failed > 0) {
    console.log(`   ⚠️  Failed states: ${failed}`);
  }

  await syncJob.complete(totalRecords);
  
  return { successful, failed, totalRecords, results };
}

/**
 * Incremental sync - sync only current month data
 */
async function runIncrementalSync(statesToSync = null) {
  console.log('\n🔄 Starting INCREMENTAL SYNC job...\n');
  
  const syncJob = await SyncJob.create({
    job_type: 'incremental',
    start_time: new Date(),
    status: 'running'
  });

  const states = statesToSync || STATES.slice(0, 5); // Sync subset for incremental
  const results = [];
  let totalRecords = 0;

  for (const state of states) {
    const result = await syncState(state, '2024-2025', syncJob);
    results.push(result);
    
    if (result.success) {
      totalRecords += result.records || 0;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n✅ INCREMENTAL SYNC COMPLETE - ${successful}/${states.length} states, ${totalRecords} records`);

  await syncJob.complete(totalRecords);
  
  return { successful, totalRecords, results };
}

/**
 * CLI runner
 */
async function main() {
  try {
    await connectDatabase();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'full';
    const stateName = args[1];

    if (command === 'state' && stateName) {
      // Sync single state
      const syncJob = await SyncJob.create({
        job_type: 'full',
        start_time: new Date(),
        status: 'running'
      });
      
      const result = await syncState(stateName.toUpperCase(), '2024-2025', syncJob);
      
      if (result.success) {
        await syncJob.complete(result.records);
        console.log(`\n✅ Successfully synced ${stateName}`);
      } else {
        await syncJob.fail(result.error);
        console.log(`\n❌ Failed to sync ${stateName}: ${result.error}`);
      }
    } else if (command === 'incremental') {
      await runIncrementalSync();
    } else {
      // Full sync
      await runFullSync(stateName ? [stateName.toUpperCase()] : null);
    }

    console.log('\n✨ ETL job completed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ETL job failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  runFullSync,
  runIncrementalSync,
  syncState
};

// Run if called directly
if (require.main === module) {
  main();
}
