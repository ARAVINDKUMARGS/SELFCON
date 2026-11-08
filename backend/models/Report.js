const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    reason: {
      type: String,
      enum: ['fraud_or_scam', 'inaccurate_listing', 'duplicate', 'offensive_content', 'safety_concerns', 'other'],
      required: true
    },
    details: {
      type: String,
      required: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending'
    },
    resolutionNotes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ property: 1, reporter: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);

