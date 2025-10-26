require('dotenv').config();
const connectDatabase = require('../config/database');
const etlNormalizer = require('../utils/etlNormalizer');
const RawResponse = require('../models/RawResponse');
const sampleData = require('../data/sample-mgnrega.json');

/**
 * Load sample data for development/testing
 * Uses sample-mgnrega.json instead of hitting the actual API
 */

async function loadSampleData() {
  try {
    console.log('\n🧪 Loading sample MGNREGA data...\n');
    
    await connectDatabase();

    // Save as raw response
    const rawResponse = await RawResponse.create({
      endpoint: 'sample-data-file',
      fetch_time: new Date(),
      state: 'SAMPLE',
      raw_data: sampleData,
      status: 'success',
      response_size_bytes: JSON.stringify(sampleData).length
    });

    console.log(`💾 Saved sample raw response (${sampleData.records.length} records)`);

    // Ensure districts exist
    const districtResult = await etlNormalizer.ensureDistrictsExist(sampleData);
    console.log(`📊 Districts - Created: ${districtResult.created.length}, Existing: ${districtResult.existing.length}`);

    // Normalize and save metrics
    const processResult = await etlNormalizer.processAndSave(
      sampleData,
      'sample-data',
      'SAMPLE',
      rawResponse._id
    );

    console.log(`✅ Sample data loaded!`);
    console.log(`   Metrics saved/updated: ${processResult.saved + processResult.updated}`);
    console.log(`   Errors: ${processResult.errors.length}`);

    if (processResult.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      processResult.errors.forEach(err => {
        console.log(`   - ${err.record}: ${err.error}`);
      });
    }

    console.log('\n💡 You can now test the API endpoints with this sample data\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Failed to load sample data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  loadSampleData();
}

module.exports = { loadSampleData };
