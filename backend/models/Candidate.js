const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['L0', 'L1', 'L2'],
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PASSED', 'REJECTED'],
    default: 'PENDING',
  },
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OpenRole',
    required: true,
  },
  roleTitle: {
    type: String,
    required: true,
  },
  name: String,
  email: String,
  phone: String,
  resumeLink: String,
  interviewLevel: {
    type: String,
    enum: ['L0', 'L1', 'L2'],
    default: 'L0',
  },
  interviewStatus: {
    type: String,
    enum: ['PENDING', 'PASSED', 'REJECTED'],
    default: 'PENDING',
  },
  feedback: [feedbackSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
