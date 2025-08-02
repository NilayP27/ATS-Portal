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

// ➤ Get candidates by projectId AND roleTitle
router.get('/by-project-role/:projectId/:roleTitle', async (req, res) => {
  const { projectId, roleTitle } = req.params;

  try {
    const candidates = await Candidate.find({
      projectId,
      roleTitle: decodeURIComponent(roleTitle),
    });
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates by project and role:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// ➤ Update candidate's interview level
router.put('/:id/interview-level', async (req, res) => {
  const { id } = req.params;
  const { interviewLevel } = req.body;

  try {
    const updated = await Candidate.findByIdAndUpdate(
      id,
      { interviewLevel },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating interview level:', err);
    res.status(500).json({ error: 'Failed to update interview level' });
  }
});

// ➤ Get a candidate by ID (used in InterviewFeedback component)
// ➤ Get a candidate by ID (used in InterviewFeedback component)
router.get('/by-id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate); // ✅ Send full candidate object including feedback
  } catch (err) {
    console.error('Error fetching candidate by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ➤ Add or update a feedback item for a candidate
router.put('/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { level, comment, status } = req.body;

  if (!level || !comment || !status) {
    return res.status(400).json({ error: 'Missing feedback fields' });
  }

  try {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const existingIndex = candidate.feedback.findIndex(fb => fb.level === level);

    if (existingIndex !== -1) {
      // Update existing feedback
      candidate.feedback[existingIndex] = { level, comment, status };
    } else {
      // Add new feedback entry
      candidate.feedback.push({ level, comment, status });
    }

    await candidate.save();
    res.json({ message: 'Feedback saved successfully', feedback: candidate.feedback });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});


module.exports = router;
