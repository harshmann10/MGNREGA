require('dotenv').config();
const connectDatabase = require('../config/database');
const District = require('../models/District');

/**
 * Seed districts collection with pan-India data
 * This creates state entries only - actual districts are populated during ETL
 * Note: No placeholder districts are created to avoid UI confusion
 */

const statesData = [
  { state: 'UTTAR PRADESH', state_code: '09', aliases: ['UP', 'U.P.'] },
  { state: 'MADHYA PRADESH', state_code: '23', aliases: ['MP', 'M.P.'] },
  { state: 'BIHAR', state_code: '10', aliases: ['BR'] },
  { state: 'ASSAM', state_code: '18', aliases: ['AS'] },
  { state: 'MAHARASHTRA', state_code: '27', aliases: ['MH'] },
  { state: 'GUJARAT', state_code: '24', aliases: ['GJ'] },
  { state: 'RAJASTHAN', state_code: '08', aliases: ['RJ'] },
  { state: 'TAMIL NADU', state_code: '33', aliases: ['TN', 'T.N.'] },
  { state: 'CHHATTISGARH', state_code: '22', aliases: ['CG', 'C.G.'] },
  { state: 'KARNATAKA', state_code: '29', aliases: ['KA', 'KAR'] },
  { state: 'TELANGANA', state_code: '36', aliases: ['TS', 'TG'] },
  { state: 'ODISHA', state_code: '21', aliases: ['OD', 'ORISSA'] },
  { state: 'ANDHRA PRADESH', state_code: '37', aliases: ['AP', 'A.P.'] },
  { state: 'PUNJAB', state_code: '03', aliases: ['PB'] },
  { state: 'JHARKHAND', state_code: '20', aliases: ['JH'] },
  { state: 'HARYANA', state_code: '06', aliases: ['HR'] },
  { state: 'ARUNACHAL PRADESH', state_code: '12', aliases: ['AR', 'A.P.'] },
  { state: 'JAMMU AND KASHMIR', state_code: '01', aliases: ['JK', 'J&K'] },
  { state: 'MANIPUR', state_code: '14', aliases: ['MN'] },
  { state: 'UTTARAKHAND', state_code: '05', aliases: ['UK', 'UA'] },
  { state: 'KERALA', state_code: '32', aliases: ['KL'] },
  { state: 'HIMACHAL PRADESH', state_code: '02', aliases: ['HP', 'H.P.'] },
  { state: 'MEGHALAYA', state_code: '17', aliases: ['ML'] },
  { state: 'WEST BENGAL', state_code: '19', aliases: ['WB', 'W.B.'] },
  { state: 'MIZORAM', state_code: '15', aliases: ['MZ'] },
  { state: 'NAGALAND', state_code: '13', aliases: ['NL'] },
  { state: 'TRIPURA', state_code: '16', aliases: ['TR'] },
  { state: 'SIKKIM', state_code: '11', aliases: ['SK'] },
  { state: 'ANDAMAN AND NICOBAR', state_code: '35', aliases: ['AN', 'A&N'] },
  { state: 'LADAKH', state_code: '38', aliases: ['LA'] },
  { state: 'PUDUCHERRY', state_code: '34', aliases: ['PY', 'PONDICHERRY'] },
  { state: 'GOA', state_code: '30', aliases: ['GA'] },
  { state: 'DN HAVELI AND DD', state_code: '26', aliases: ['DNH', 'DD'] },
  { state: 'LAKSHADWEEP', state_code: '31', aliases: ['LD'] }
];

async function seedDistricts() {
  try {
    console.log('\n🌱 Starting districts seed...\n');
    
    await connectDatabase();

    // Clear existing STATE LEVEL placeholders only
    const deleteResult = await District.deleteMany({ 
      district_name: { $regex: /STATE LEVEL/i } 
    });
    console.log(`🗑️  Removed ${deleteResult.deletedCount} STATE LEVEL placeholders`);

    let created = 0;
    let existing = 0;

    for (const stateData of statesData) {
      // Check if any real districts exist for this state
      const existingDistricts = await District.countDocuments({ 
        state: stateData.state,
        district_name: { $not: /STATE LEVEL/i }
      });

      if (existingDistricts === 0) {
        console.log(`⏳ ${stateData.state}: No districts yet - will be populated by ETL`);
        // Don't create placeholder entries - let ETL handle it
        created++;
      } else {
        console.log(`✅ ${stateData.state}: ${existingDistricts} districts already exist`);
        existing++;
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   States ready for ETL: ${created}`);
    console.log(`   States with districts: ${existing}`);
    console.log(`\n💡 Run ETL to populate actual districts:`);
    console.log(`   npm run etl:state "UTTAR PRADESH"  # Single state`);
    console.log(`   npm run etl                        # All states\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDistricts();
}

module.exports = { seedDistricts, statesData };
