const mongoose = require('mongoose');

const errorEntrySchema = new mongoose.Schema({
  msg: String,
  code: String,
  time: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const syncJobSchema = new mongoose.Schema({
  job_type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full', 'incremental', 'hourly'],
    index: true
  },
  start_time: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  end_time: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['running', 'success', 'failed'],
    default: 'running',
    index: true
  },
  records_fetched: {
    type: Number,
    default: 0,
    min: 0
  },
  errors: [errorEntrySchema],
  attempts: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Compound index for finding recent jobs
syncJobSchema.index({ job_type: 1, start_time: -1 });
syncJobSchema.index({ status: 1, start_time: -1 });

// Virtual for job duration
syncJobSchema.virtual('duration').get(function() {
  if (!this.end_time) return null;
  return this.end_time - this.start_time; // milliseconds
});

// Instance method to complete job successfully
syncJobSchema.methods.complete = function(recordsFetched = 0) {
  this.status = 'success';
  this.end_time = new Date();
  this.records_fetched = recordsFetched;
  return this.save();
};

// Instance method to fail job
syncJobSchema.methods.fail = function(errorMsg, errorCode = null) {
  this.status = 'failed';
  this.end_time = new Date();
  this.errors.push({
    msg: errorMsg,
    code: errorCode,
    time: new Date()
  });
  return this.save();
};

// Instance method to add error without failing
syncJobSchema.methods.addError = function(errorMsg, errorCode = null) {
  this.errors.push({
    msg: errorMsg,
    code: errorCode,
    time: new Date()
  });
  return this.save();
};

// Static method to find last successful sync
syncJobSchema.statics.findLastSuccess = function(jobType = null) {
  const query = { status: 'success' };
  if (jobType) query.job_type = jobType;
  
  return this.findOne(query).sort({ start_time: -1 });
};

// Static method to find running jobs
syncJobSchema.statics.findRunning = function() {
  return this.find({ status: 'running' }).sort({ start_time: -1 });
};

const SyncJob = mongoose.model('SyncJob', syncJobSchema);

module.exports = SyncJob;
