const mongoose = require('mongoose');

const districtMetricSchema = new mongoose.Schema({
  district_code: {
    type: String,
    required: [true, 'District code is required'],
    trim: true,
    index: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    uppercase: true,
    index: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2000,
    max: 2100
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12
  },
  total_households_worked: {
    type: Number,
    default: 0,
    min: 0
  },
  total_persondays_generated: {
    type: Number,
    default: 0,
    min: 0
  },
  total_wage_disbursed: {
    type: Number,
    default: 0,
    min: 0
  },
  pending_payments: {
    type: Number,
    default: 0,
    min: 0
  },
  other_metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  last_updated: {
    type: Date,
    required: true,
    default: Date.now
  },
  source_raw_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawResponse',
    default: null
  },
  stale: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries (as per RPD section 6)
districtMetricSchema.index({ district_code: 1, year: 1, month: 1 }, { unique: true });

// Index for state-level aggregations
districtMetricSchema.index({ state: 1, year: 1, month: 1 });

// Index for finding stale records
districtMetricSchema.index({ stale: 1, last_updated: -1 });

// Virtual for checking if data is stale (older than 36 hours)
districtMetricSchema.virtual('isStale').get(function() {
  const hoursSinceUpdate = (Date.now() - this.last_updated) / (1000 * 60 * 60);
  return hoursSinceUpdate > 36;
});

// Instance method to mark as stale
districtMetricSchema.methods.markStale = function() {
  this.stale = true;
  return this.save();
};

// Static method to find trends for a district
districtMetricSchema.statics.findTrends = function(districtCode, months = 12) {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setMonth(startDate.getMonth() - months);

  return this.find({
    district_code: districtCode,
    $expr: {
      $gte: [
        { $add: [{ $multiply: ['$year', 12] }, '$month'] },
        startDate.getFullYear() * 12 + startDate.getMonth() + 1
      ]
    }
  }).sort({ year: 1, month: 1 }).lean();
};

// Static method to calculate state average
districtMetricSchema.statics.getStateAverage = async function(state, year, month) {
  const result = await this.aggregate([
    { $match: { state, year, month } },
    {
      $group: {
        _id: null,
        avg_households: { $avg: '$total_households_worked' },
        avg_persondays: { $avg: '$total_persondays_generated' },
        avg_wages: { $avg: '$total_wage_disbursed' },
        avg_pending: { $avg: '$pending_payments' }
      }
    }
  ]);

  return result[0] || null;
};

const DistrictMetric = mongoose.model('DistrictMetric', districtMetricSchema);

module.exports = DistrictMetric;
