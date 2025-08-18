const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const Project = require('../models/Project');
const Candidate = require('../models/Candidate'); // Import your Candidate model
const roleMiddleware = require('../middleware/roleMiddleware');
const NotificationService = require('../utils/notificationService');


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
      
      // Create notification for project creation
      try {
        await NotificationService.notifyProjectCreated(project, req.user._id);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }
      
      res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

/**
 * @route GET /api/projects
 * @desc Get all projects with candidate stats
 * @access All Authenticated Users
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const projects = await Project.find();

      // For each project, fetch candidate stats
      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          const candidates = await Candidate.find({ projectId: project._id });

          // Count by pipeline stage
          const pipeline = candidates.reduce((acc, cand) => {
            const stage = cand.stage || 'Unassigned';
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
          }, {});

          return {
            ...project.toObject(),
            candidatesCount: candidates.length,
            rolesRequested: project.roles?.length || 0,
            totalPositions: project.roles?.reduce(
              (sum, role) => sum + (role.count || 0),
              0
            ),
            filledPositions: candidates.filter((c) => c.status === 'Hired')
              .length,
            pipeline,
          };
        })
      );

      res.json(enrichedProjects);
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
