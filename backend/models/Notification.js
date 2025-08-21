const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PROJECT_CREATED', 'PROJECT_UPDATED', 'CANDIDATE_ADDED', 'ROLE_FILLED', 'DEADLINE_APPROACHING', 'SYSTEM_MAINTENANCE'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

