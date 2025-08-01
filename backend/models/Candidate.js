const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  roleTitle: {
    type: String,
    required: true
  },
  name: String,
  email: String,
  phone: String,
  resumeLink: String,

  interviewLevel: {
    type: String,
    enum: ['L0', 'L1', 'L2'],
    default: 'L0'
  },
  interviewStatus: {
    type: String,
    enum: ['PENDING', 'PASSED', 'REJECTED'],
    default: 'PENDING'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
