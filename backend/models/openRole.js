// models/OpenRole.js
const mongoose = require('mongoose');

const openRoleSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  deadline: { type: String },
  startDate: { type: String },
  endDate: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('OpenRole', openRoleSchema);
