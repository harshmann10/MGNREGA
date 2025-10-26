const mongoose = require('mongoose');

const rawResponseSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: [true, 'API endpoint is required'],
    trim: true
  },
  fetch_time: {
    type: Date,
    required: true,
    default: Date.now,
    index: true  // For TTL/archival queries
  },
  state: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  district_code: {
    type: String,
    default: null,
    trim: true,
    index: true
  },
  raw_data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed'],
    default: 'success'
  },
  error_message: {
    type: String,
    default: null
  },
  response_size_bytes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
rawResponseSchema.index({ state: 1, district_code: 1, fetch_time: -1 });
rawResponseSchema.index({ status: 1, fetch_time: -1 });

// TTL index - automatically delete documents older than 90 days (as per RPD section 7)
// 7776000 seconds = 90 days
rawResponseSchema.index({ fetch_time: 1 }, { expireAfterSeconds: 7776000 });

// Pre-save hook to calculate response size
rawResponseSchema.pre('save', function(next) {
  if (this.raw_data) {
    this.response_size_bytes = JSON.stringify(this.raw_data).length;
  }
  next();
});

// Static method to find latest successful response for a district
rawResponseSchema.statics.findLatestSuccess = function(districtCode) {
  return this.findOne({
    district_code: districtCode,
    status: 'success'
  }).sort({ fetch_time: -1 });
};

const RawResponse = mongoose.model('RawResponse', rawResponseSchema);

module.exports = RawResponse;
