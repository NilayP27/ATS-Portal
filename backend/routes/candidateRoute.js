const express = require('express');
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const router = express.Router();

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

router.get('/:projectId/overview', async (req, res) => {
  const { projectId } = req.params;

  try {
    const candidates = await Candidate.find({ projectId });

    const interviewStats = {
      L0: { passed: 0, pending: 0, rejected: 0 },
      L1: { passed: 0, pending: 0, rejected: 0 },
      L2: { passed: 0, pending: 0, rejected: 0 },
    };

    const currentLevelStats = {
      L0: 0,
      L1: 0,
      L2: 0,
    };

    const roleStatsMap = {};

    candidates.forEach((candidate) => {
      const { roleTitle, feedback = [], interviewLevel } = candidate;

      if (interviewLevel && currentLevelStats[interviewLevel] !== undefined) {
        currentLevelStats[interviewLevel] += 1;
      }

      if (!roleStatsMap[roleTitle]) {
        roleStatsMap[roleTitle] = {
          total: 0,
          selected: 0,
          rejected: 0,
        };
      }

      roleStatsMap[roleTitle].total += 1;

      let hasRejected = false;

      feedback.forEach((fb) => {
        const { level, status } = fb;
        const lowerStatus = status?.toLowerCase();

        if (interviewStats[level] && interviewStats[level][lowerStatus] !== undefined) {
          interviewStats[level][lowerStatus] += 1;
        }

        if (status === 'REJECTED') {
          hasRejected = true;
        }
      });

      const passedAll = ['L0', 'L1', 'L2'].every((level) =>
        feedback.find((fb) => fb.level === level && fb.status === 'PASSED')
      );

      if (passedAll) {
        roleStatsMap[roleTitle].selected += 1;
      } else if (hasRejected) {
        roleStatsMap[roleTitle].rejected += 1;
      }
    });

    const roleStats = Object.entries(roleStatsMap).map(([title, stats]) => ({
      title,
      total: stats.total,
      selected: stats.selected,
      rejected: stats.rejected,
    }));

    res.json({
      interviewStats,
      currentLevelStats,
      roles: roleStats,
    });
  } catch (err) {
    console.error('Error fetching project overview:', err);
    res.status(500).json({ error: 'Failed to fetch candidate stats' });
  }
});

router.get('/:projectId', async (req, res) => {
  try {
    const candidates = await Candidate.find({ projectId: req.params.projectId });
    res.json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

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

router.get('/by-id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err) {
    console.error('Error fetching candidate by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

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
      candidate.feedback[existingIndex] = { level, comment, status };
    } else {
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
