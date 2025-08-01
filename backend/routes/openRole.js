const express = require('express');
const mongoose = require('mongoose');
const OpenRole = require('../models/openRole');

const router = express.Router();

// Create a new open role
router.post('/', async (req, res) => {
  try {
    const role = new OpenRole(req.body);
    await role.save();
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Get all roles for a specific project
router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const roles = await OpenRole.find({ projectId: new mongoose.Types.ObjectId(projectId) });
    res.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

module.exports = router;
