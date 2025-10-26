const RawResponse = require('../models/RawResponse');
const DistrictMetric = require('../models/DistrictMetric');
const District = require('../models/District');

/**
 * Normalize raw MGNREGA API data to district_metrics schema
 * Handles field mapping and data transformation
 */
class ETLNormalizer {
  /**
   * Map month name to number
   */
  getMonthNumber(monthName) {
    const months = {
      'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
      'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12,
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'Jun': 6, 'Jul': 7, 'Aug': 8,
      'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };
    
    return months[monthName] || parseInt(monthName) || null;
  }

  /**
   * Parse financial year to get year number
   */
  parseFinancialYear(finYear) {
    // "2024-2025" => 2024
    const match = finYear.match(/(\d{4})/);
    return match ? parseInt(match[1]) : new Date().getFullYear();
  }

  /**
   * Normalize a single record from API response
   */
  normalizeRecord(record) {
    try {
      const monthNum = this.getMonthNumber(record.month);
      const year = this.parseFinancialYear(record.fin_year);

      if (!monthNum) {
        console.warn(`⚠️  Invalid month: ${record.month}`);
        return null;
      }

      // Map API fields to our schema
      const normalized = {
        district_code: record.district_code?.toString().trim(),
        state: record.state_name?.toUpperCase().trim(),
        year,
        month: monthNum,
        
        // Core metrics
        total_households_worked: parseInt(record.Total_Households_Worked) || 0,
        total_persondays_generated: parseInt(record.Persondays_of_Central_Liability_so_far) || 0,
        total_wage_disbursed: parseFloat(record.Wages) || 0,
        
        // Calculate pending payments (this is an approximation)
        pending_payments: 0, // Will need actual pending payment field from API if available
        
        // Store all other metrics in other_metrics object
        other_metrics: {
          total_individuals_worked: parseInt(record.Total_Individuals_Worked) || 0,
          total_active_job_cards: parseInt(record.Total_No_of_Active_Job_Cards) || 0,
          total_active_workers: parseInt(record.Total_No_of_Active_Workers) || 0,
          sc_persondays: parseInt(record.SC_persondays) || 0,
          st_persondays: parseInt(record.ST_persondays) || 0,
          women_persondays: parseInt(record.Women_Persondays) || 0,
          average_wage_rate: parseFloat(record.Average_Wage_rate_per_day_per_person) || 0,
          average_days_per_household: parseInt(record.Average_days_of_employment_provided_per_Household) || 0,
          completed_works: parseInt(record.Number_of_Completed_Works) || 0,
          ongoing_works: parseInt(record.Number_of_Ongoing_Works) || 0,
          total_expenditure: parseFloat(record.Total_Exp) || 0,
          material_wages: parseFloat(record.Material_and_skilled_Wages) || 0,
          households_100_days: parseInt(record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment) || 0
        },
        
        last_updated: new Date(),
        stale: false
      };

      return normalized;
    } catch (error) {
      console.error('❌ Error normalizing record:', error.message, record);
      return null;
    }
  }

  /**
   * Save raw response and normalize to district_metrics
   */
  async processAndSave(rawData, endpoint, state, sourceRawId = null) {
    const results = {
      saved: 0,
      updated: 0,
      errors: []
    };

    if (!rawData || !rawData.records || rawData.records.length === 0) {
      console.warn('⚠️  No records to process');
      return results;
    }

    for (const record of rawData.records) {
      try {
        const normalized = this.normalizeRecord(record);
        
        if (!normalized || !normalized.district_code) {
          results.errors.push({ 
            record: record.district_name, 
            error: 'Normalization failed or missing district_code' 
          });
          continue;
        }

        // Upsert district_metrics
        const result = await DistrictMetric.findOneAndUpdate(
          {
            district_code: normalized.district_code,
            year: normalized.year,
            month: normalized.month
          },
          {
            ...normalized,
            source_raw_id: sourceRawId
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );

        if (result) {
          results.updated++;
        } else {
          results.saved++;
        }

      } catch (error) {
        console.error(`❌ Error saving metric for ${record.district_name}:`, error.message);
        results.errors.push({ 
          record: record.district_name, 
          error: error.message 
        });
      }
    }

    return results;
  }

  /**
   * Extract unique districts from raw data and ensure they exist in districts collection
   */
  async ensureDistrictsExist(rawData) {
    const created = [];
    const existing = [];

    if (!rawData || !rawData.records) return { created, existing };

    // Get unique districts from records
    const uniqueDistricts = new Map();
    
    for (const record of rawData.records) {
      const key = record.district_code;
      if (!uniqueDistricts.has(key)) {
        uniqueDistricts.set(key, {
          state: record.state_name?.toUpperCase().trim(),
          state_code: record.state_code?.toString().trim(),
          district_code: record.district_code?.toString().trim(),
          district_name: record.district_name?.trim()
        });
      }
    }

    // Ensure each district exists in DB
    for (const [key, districtData] of uniqueDistricts) {
      try {
        const exists = await District.findOne({ district_code: districtData.district_code });
        
        if (!exists) {
          const newDistrict = await District.create(districtData);
          created.push(newDistrict.district_name);
          console.log(`✅ Created district: ${newDistrict.district_name}`);
        } else {
          existing.push(exists.district_name);
        }
      } catch (error) {
        console.error(`❌ Error ensuring district exists: ${districtData.district_name}`, error.message);
      }
    }

    return { created, existing };
  }
}

module.exports = new ETLNormalizer();
