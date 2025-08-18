const express = require('express');
const passport = require('passport');
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const Candidate = require('../models/Candidate');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @route GET /api/notifications
 * @desc Get notifications for the current user
 * @access All Authenticated Users
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { limit = 20, unreadOnly = false } = req.query;
      
      let query = { userId };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('projectId', 'projectName clientName')
        .populate('candidateId', 'name roleTitle');
      
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get count of unread notifications
 * @access All Authenticated Users
 */
router.get(
  '/unread-count',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const count = await Notification.countDocuments({ userId, isRead: false });
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }
);

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark a notification as read
 * @access All Authenticated Users
 */
router.patch(
  '/:id/read',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all notifications as read for the current user
 * @access All Authenticated Users
 */
router.patch(
  '/read-all',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  }
);

/**
 * @route POST /api/notifications/generate
 * @desc Generate system notifications based on current data
 * @access Admin only
 */
router.post(
  '/generate',
  passport.authenticate('jwt', { session: false }),
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const generatedNotifications = [];
      
      // Get all projects
      const projects = await Project.find();
      
      for (const project of projects) {
        // Check for projects with approaching deadlines
        const projectStartDate = new Date(project.startDate);
        const daysUntilStart = Math.ceil((projectStartDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilStart <= 7 && daysUntilStart > 0) {
          const notification = new Notification({
            type: 'DEADLINE_APPROACHING',
            title: 'Project Start Date Approaching',
            message: `Project "${project.projectName}" starts in ${daysUntilStart} day(s)`,
            userId: project.lead, // Assuming lead is a user ID
            projectId: project._id,
            priority: daysUntilStart <= 3 ? 'HIGH' : 'MEDIUM'
          });
          generatedNotifications.push(notification);
        }
        
        // Check for projects with no candidates
        const candidateCount = await Candidate.countDocuments({ projectId: project._id });
        if (candidateCount === 0 && project.status === 'ACTIVE') {
          const notification = new Notification({
            type: 'PROJECT_UPDATED',
            title: 'Project Needs Candidates',
            message: `Project "${project.projectName}" has no candidates yet`,
            userId: project.lead,
            projectId: project._id,
            priority: 'MEDIUM'
          });
          generatedNotifications.push(notification);
        }
      }
      
      // Save all generated notifications
      if (generatedNotifications.length > 0) {
        await Notification.insertMany(generatedNotifications);
      }
      
      res.json({ 
        message: `Generated ${generatedNotifications.length} notifications`,
        count: generatedNotifications.length
      });
    } catch (error) {
      console.error('Error generating notifications:', error);
      res.status(500).json({ error: 'Failed to generate notifications' });
    }
  }
);

module.exports = router;

