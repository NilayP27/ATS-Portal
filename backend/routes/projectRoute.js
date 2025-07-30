const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project'); // Adjust path if needed

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST /api/projects
router.post('/', upload.array('jobDescFiles'), async (req, res) => {
  try {
    if (!req.body.data) {
      return res.status(400).json({ error: "Missing project data in request." });
    }

    const data = JSON.parse(req.body.data);
    const files = req.files;

    const rolesWithFiles = data.roles.map((role, index) => ({
      ...role,
      jobDescFilePath: files[index]?.path || '',
    }));

    const project = new Project({
      ...data,
      roles: rolesWithFiles,
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});
router.get('/', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

module.exports = router;
