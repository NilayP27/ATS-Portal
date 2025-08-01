const express = require('express');
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const router = express.Router();

// ➤ Create a new candidate
router.post('/', async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json({ message: 'Candidate added successfully', candidate });
  } catch (err) {
    console.error('Error adding candidate:', err);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

// ➤ Get interview stats & role-wise stats for a project
router.get('/:projectId/overview', async (req, res) => {
  const { projectId } = req.params;

  try {
    // Interview level-wise stats (L0/L1/L2)
    const interviewStats = await Candidate.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: { level: '$interviewLevel', status: '$interviewStatus' },
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {};
    for (const item of interviewStats) {
      const level = item._id.level;
      const status = item._id.status;
      if (!formattedStats[level]) {
        formattedStats[level] = { passed: 0, pending: 0, rejected: 0 };
      }
      formattedStats[level][status.toLowerCase()] = item.count;
    }

    // Role-wise candidate stats
    const roleStats = await Candidate.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: '$roleTitle',
          total: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$interviewStatus', 'PASSED'] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$interviewStatus', 'REJECTED'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      interviewStats: formattedStats,
      roles: roleStats.map((r) => ({
        title: r._id,
        total: r.total,
        selected: r.selected,
        rejected: r.rejected,
      })),
    });
  } catch (err) {
    console.error('Error fetching project overview:', err);
    res.status(500).json({ error: 'Failed to fetch candidate stats' });
  }
});

// ➤ Get all candidates for a specific project
router.get('/:projectId', async (req, res) => {
  try {
    const candidates = await Candidate.find({ projectId: req.params.projectId });
    res.json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// ➤ NEW: Get candidates by role title
router.get('/by-role', async (req, res) => {
  const { roleTitle } = req.query;

  if (!roleTitle) {
    return res.status(400).json({ error: 'Missing roleTitle in query' });
  }

  try {
    const candidates = await Candidate.find({ roleTitle });
    res.json(candidates);
  } catch (err) {
    console.error('Error fetching candidates by role:', err);
    res.status(500).json({ error: 'Failed to fetch candidates by role' });
  }
});
router.get('/by-role/:roleTitle', async (req, res) => {
  const { roleTitle } = req.params;
  try {
    const candidates = await Candidate.find({ roleTitle });
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates by role:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});


module.exports = router;
