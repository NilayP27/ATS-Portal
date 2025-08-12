const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const Project = require('../models/Project');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Project Initiator, Admin
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  roleMiddleware('create_project'),
  upload.array('jobDescFiles'),
  async (req, res) => {
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
  }
);

/**
 * @route GET /api/projects
 * @desc Get all projects
 * @access All Authenticated Users
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const projects = await Project.find();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }
);

/**
 * @route GET /api/projects/:projectId
 * @desc Get a single project by ID
 * @access All Authenticated Users
 */
router.get(
  '/:projectId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }
);

/**
 * @route PUT /api/projects/:projectId
 * @desc Edit a project
 * @access Project Initiator, Admin
 */
router.put(
  '/:projectId',
  passport.authenticate('jwt', { session: false }),
  roleMiddleware('edit_project'),
  async (req, res) => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.projectId,
        req.body,
        { new: true }
      );
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project updated successfully', project });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
);

/**
 * @route DELETE /api/projects/:projectId
 * @desc Delete a project (soft delete or archive if needed)
 * @access Project Initiator, Admin
 */
router.delete(
  '/:projectId',
  passport.authenticate('jwt', { session: false }),
  roleMiddleware('delete_project'),
  async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
);

module.exports = router;
