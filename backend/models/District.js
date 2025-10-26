const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    uppercase: true
  },
  state_code: {
    type: String,
    required: [true, 'State code is required'],
    trim: true
  },
  district_code: {
    type: String,
    required: [true, 'District code is required'],
    unique: true,
    trim: true,
    index: true
  },
  district_name: {
    type: String,
    required: [true, 'District name is required'],
    trim: true
  },
  centroid: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  aliases: [{
    type: String,
    trim: true
  }],
  geojsonRef: {
    type: String,
    default: null
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Compound index for efficient state-based queries
districtSchema.index({ state: 1, district_code: 1 });

// Text index for search functionality
districtSchema.index({ district_name: 'text', aliases: 'text' });

// Instance method to get district summary
districtSchema.methods.getSummary = function() {
  return {
    district_code: this.district_code,
    district_name: this.district_name,
    state: this.state,
    centroid: this.centroid
  };
};

const District = mongoose.model('District', districtSchema);

module.exports = District;
