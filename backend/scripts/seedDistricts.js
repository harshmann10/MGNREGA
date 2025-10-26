require('dotenv').config();
const connectDatabase = require('../config/database');
const District = require('../models/District');

/**
 * Seed districts collection with pan-India data
 * This is a starter seed with state-level info
 * District-level data will be populated during ETL from API
 * 
 * NOTE: Currently limited to Uttar Pradesh only for testing purposes
 */

const statesData = [
  { state: 'UTTAR PRADESH', state_code: '09', aliases: ['UP', 'U.P.'] },
  // { state: 'MADHYA PRADESH', state_code: '23', aliases: ['MP', 'M.P.'] },
  // { state: 'BIHAR', state_code: '10', aliases: ['BR'] },
  // { state: 'ASSAM', state_code: '18', aliases: ['AS'] },
  // { state: 'MAHARASHTRA', state_code: '27', aliases: ['MH'] },
  // { state: 'GUJARAT', state_code: '24', aliases: ['GJ'] },
  // { state: 'RAJASTHAN', state_code: '08', aliases: ['RJ'] },
  // { state: 'TAMIL NADU', state_code: '33', aliases: ['TN', 'T.N.'] },
  // { state: 'CHHATTISGARH', state_code: '22', aliases: ['CG', 'C.G.'] },
  // { state: 'KARNATAKA', state_code: '29', aliases: ['KA', 'KAR'] },
  // { state: 'TELANGANA', state_code: '36', aliases: ['TS', 'TG'] },
  // { state: 'ODISHA', state_code: '21', aliases: ['OD', 'ORISSA'] },
  // { state: 'ANDHRA PRADESH', state_code: '37', aliases: ['AP', 'A.P.'] },
  // { state: 'PUNJAB', state_code: '03', aliases: ['PB'] },
  // { state: 'JHARKHAND', state_code: '20', aliases: ['JH'] },
  // { state: 'HARYANA', state_code: '06', aliases: ['HR'] },
  // { state: 'ARUNACHAL PRADESH', state_code: '12', aliases: ['AR', 'A.P.'] },
  // { state: 'JAMMU AND KASHMIR', state_code: '01', aliases: ['JK', 'J&K'] },
  // { state: 'MANIPUR', state_code: '14', aliases: ['MN'] },
  // { state: 'UTTARAKHAND', state_code: '05', aliases: ['UK', 'UA'] },
  // { state: 'KERALA', state_code: '32', aliases: ['KL'] },
  // { state: 'HIMACHAL PRADESH', state_code: '02', aliases: ['HP', 'H.P.'] },
  // { state: 'MEGHALAYA', state_code: '17', aliases: ['ML'] },
  // { state: 'WEST BENGAL', state_code: '19', aliases: ['WB', 'W.B.'] },
  // { state: 'MIZORAM', state_code: '15', aliases: ['MZ'] },
  // { state: 'NAGALAND', state_code: '13', aliases: ['NL'] },
  // { state: 'TRIPURA', state_code: '16', aliases: ['TR'] },
  // { state: 'SIKKIM', state_code: '11', aliases: ['SK'] },
  // { state: 'ANDAMAN AND NICOBAR', state_code: '35', aliases: ['AN', 'A&N'] },
  // { state: 'LADAKH', state_code: '38', aliases: ['LA'] },
  // { state: 'PUDUCHERRY', state_code: '34', aliases: ['PY', 'PONDICHERRY'] },
  // { state: 'GOA', state_code: '30', aliases: ['GA'] },
  // { state: 'DN HAVELI AND DD', state_code: '26', aliases: ['DNH', 'DD'] },
  // { state: 'LAKSHADWEEP', state_code: '31', aliases: ['LD'] }
];

async function seedDistricts() {
  try {
    console.log('\n🌱 Starting districts seed...\n');
    
    await connectDatabase();

    // Clear existing data (optional - comment out if you want to keep existing)
    await District.deleteMany({});
    console.log('🗑️  Cleared existing districts');

    let created = 0;
    let existing = 0;

    for (const stateData of statesData) {
      // Check if state entry exists
      const exists = await District.findOne({ 
        state: stateData.state
      });

      if (!exists) {
        // Create placeholder district entry for state
        // Actual districts will be populated during ETL
        await District.create({
          state: stateData.state,
          state_code: stateData.state_code,
          district_code: `${stateData.state_code}00`, // Placeholder code
          district_name: `${stateData.state} - STATE LEVEL`,
          aliases: stateData.aliases
        });
        created++;
        console.log(`✅ Created state entry: ${stateData.state}`);
      } else {
        existing++;
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Created: ${created} states`);
    console.log(`   Existing: ${existing} states`);
    console.log(`\n💡 Note: District-level data will be populated when you run the ETL job`);
    console.log(`   Run: npm run etl\n`);

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
