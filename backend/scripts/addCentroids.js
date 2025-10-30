require('dotenv').config();
const connectDatabase = require('../config/database');
const District = require('../models/District');

/**
 * Add default centroids to districts that don't have them
 * Uses approximate state-level centroids as fallback
 */

const STATE_CENTROIDS = {
  'UTTAR PRADESH': { lat: 27.0, lng: 81.0 },
  'MADHYA PRADESH': { lat: 23.0, lng: 77.0 },
  'BIHAR': { lat: 25.6, lng: 85.2 },
  'ASSAM': { lat: 26.2, lng: 92.9 },
  'MAHARASHTRA': { lat: 19.7, lng: 75.7 },
  'GUJARAT': { lat: 22.3, lng: 71.2 },
  'RAJASTHAN': { lat: 27.0, lng: 74.2 },
  'TAMIL NADU': { lat: 11.1, lng: 78.7 },
  'CHHATTISGARH': { lat: 21.3, lng: 81.9 },
  'KARNATAKA': { lat: 15.3, lng: 75.7 },
  'TELANGANA': { lat: 18.1, lng: 79.0 },
  'ODISHA': { lat: 20.9, lng: 85.1 },
  'ANDHRA PRADESH': { lat: 15.9, lng: 79.7 },
  'PUNJAB': { lat: 31.1, lng: 75.3 },
  'JHARKHAND': { lat: 23.6, lng: 85.3 },
  'HARYANA': { lat: 29.1, lng: 76.0 },
  'ARUNACHAL PRADESH': { lat: 28.2, lng: 94.7 },
  'JAMMU AND KASHMIR': { lat: 33.7, lng: 76.6 },
  'MANIPUR': { lat: 24.7, lng: 93.9 },
  'UTTARAKHAND': { lat: 30.1, lng: 79.0 },
  'KERALA': { lat: 10.8, lng: 76.3 },
  'HIMACHAL PRADESH': { lat: 31.1, lng: 77.2 },
  'MEGHALAYA': { lat: 25.5, lng: 91.4 },
  'WEST BENGAL': { lat: 22.9, lng: 87.9 },
  'MIZORAM': { lat: 23.2, lng: 92.9 },
  'NAGALAND': { lat: 26.2, lng: 94.6 },
  'TRIPURA': { lat: 23.9, lng: 91.9 },
  'SIKKIM': { lat: 27.5, lng: 88.5 },
  'ANDAMAN AND NICOBAR': { lat: 11.7, lng: 92.7 },
  'LADAKH': { lat: 34.2, lng: 77.6 },
  'PUDUCHERRY': { lat: 11.9, lng: 79.8 },
  'GOA': { lat: 15.3, lng: 74.1 },
  'DN HAVELI AND DD': { lat: 20.4, lng: 72.8 },
  'LAKSHADWEEP': { lat: 10.6, lng: 72.6 },
  'DELHI': { lat: 28.7, lng: 77.1 }
};

async function addCentroids() {
  try {
    await connectDatabase();

    console.log('\n🔍 Checking districts for missing centroids...\n');

    const districts = await District.find();
    console.log(`📊 Total districts: ${districts.length}`);

    let updated = 0;
    let alreadyHave = 0;
    let errors = 0;

    for (const district of districts) {
      // Check if centroid exists and has valid data
      if (district.centroid?.lat && district.centroid?.lng) {
        alreadyHave++;
        continue;
      }

      // Get state centroid as fallback
      const stateCentroid = STATE_CENTROIDS[district.state];

      if (!stateCentroid) {
        console.log(`⚠️  No centroid available for state: ${district.state}`);
        errors++;
        continue;
      }

      // Add small random offset to avoid all districts in same state having exact same coordinates
      const randomOffset = () => (Math.random() - 0.5) * 0.5; // ±0.25 degrees (~25km)

      district.centroid = {
        lat: stateCentroid.lat + randomOffset(),
        lng: stateCentroid.lng + randomOffset()
      };

      await district.save();
      updated++;

      if (updated % 10 === 0) {
        console.log(`✅ Updated ${updated} districts...`);
      }
    }

    console.log('\n✅ Centroid update complete!');
    console.log(`   Already had centroids: ${alreadyHave}`);
    console.log(`   Updated with state centroids: ${updated}`);
    console.log(`   Errors/Unknown states: ${errors}`);
    console.log(`   Total: ${districts.length}\n`);

    // Verify
    const withCentroids = await District.countDocuments({
      'centroid.lat': { $exists: true, $ne: null },
      'centroid.lng': { $exists: true, $ne: null }
    });

    console.log(`✅ Districts with valid centroids: ${withCentroids}/${districts.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCentroids();
