const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  currency: { type: String, required: true },
  deadline: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  jobDescFilePath: { type: String }, // path to uploaded file (optional)
});

const projectSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  projectName: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Staffing', 'Consulting'], default: 'Staffing' },
  startDate: { type: String, required: true },
  roles: [roleSchema],
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Project', projectSchema);
