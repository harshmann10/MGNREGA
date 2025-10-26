const axios = require('axios');

/**
 * Fetch data from data.gov.in with exponential backoff retry
 * As per RPD section 7: 5s → 30s → 2m → 10m; max attempts 5
 */
class APIFetcher {
  constructor() {
    this.baseURL = process.env.API_BASE_URL;
    this.apiKey = process.env.DATA_GOV_API_KEY;
    // this.resourceId = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722'; // MGNREGA resource ID
    this.maxAttempts = 5;
    this.delays = [5000, 30000, 120000, 600000]; // 5s, 30s, 2m, 10m
  }

  /**
   * Build query URL for data.gov.in API
   */
  buildURL(filters = {}, limit = 100, offset = 0) {
    const params = new URLSearchParams({
      'api-key': this.apiKey,
      format: 'json',
      limit: limit.toString(),
      offset: offset.toString()
    });

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, value);
    });

    return `${this.baseURL}?${params.toString()}`;
  }

  /**
   * Sleep helper for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch with retry logic
   */
  async fetchWithRetry(url, attempt = 1) {
    try {
      console.log(`🔄 Fetching data (attempt ${attempt}/${this.maxAttempts})...`);
      
      const response = await axios.get(url, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'MGNREGA-Dashboard/1.0'
        }
      });

      if (response.data && response.data.records) {
        console.log(`✅ Fetched ${response.data.records.length} records`);
        return {
          success: true,
          data: response.data,
          records: response.data.records,
          total: response.data.total || 0,
          count: response.data.count || 0
        };
      }

      throw new Error('Invalid response format from API');

    } catch (error) {
      const isLastAttempt = attempt >= this.maxAttempts;
      
      console.error(`❌ Fetch failed (attempt ${attempt}/${this.maxAttempts}):`, error.message);

      if (isLastAttempt) {
        return {
          success: false,
          error: error.message,
          code: error.code || 'FETCH_FAILED',
          attempts: attempt
        };
      }

      // Calculate delay with exponential backoff
      const delayIndex = Math.min(attempt - 1, this.delays.length - 1);
      const delay = this.delays[delayIndex];
      
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await this.sleep(delay);
      
      return this.fetchWithRetry(url, attempt + 1);
    }
  }

  /**
   * Fetch data for a specific state and financial year
   */
  async fetchStateData(stateName, finYear = '2024-2025', limit = 1000, offset = 0) {
    const url = this.buildURL({
      state_name: stateName.toUpperCase(),
      fin_year: finYear
    }, limit, offset);

    return this.fetchWithRetry(url);
  }

  /**
   * Fetch data for a specific district
   */
  async fetchDistrictData(stateName, districtName, finYear = '2024-2025') {
    const url = this.buildURL({
      state_name: stateName.toUpperCase(),
      district_name: districtName.toUpperCase(),
      fin_year: finYear
    }, 100, 0);

    return this.fetchWithRetry(url);
  }

  /**
   * Fetch all records for a state (handles pagination)
   */
  async fetchAllStateRecords(stateName, finYear = '2024-2025') {
    const allRecords = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const result = await this.fetchStateData(stateName, finYear, limit, offset);
      
      if (!result.success) {
        return result;
      }

      allRecords.push(...result.records);
      
      // Check if there are more records
      hasMore = result.records.length === limit;
      offset += limit;

      console.log(`📊 Fetched ${allRecords.length} total records for ${stateName}`);

      // Small delay to avoid rate limiting
      if (hasMore) {
        await this.sleep(1000);
      }
    }

    return {
      success: true,
      records: allRecords,
      total: allRecords.length
    };
  }
}

module.exports = new APIFetcher();
