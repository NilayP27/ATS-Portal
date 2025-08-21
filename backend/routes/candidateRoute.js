const express = require("express");
const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const Project = require("../models/Project");
const passport = require("passport");
const { checkRole } = require("../middleware/roleMiddleware");
const NotificationService = require("../utils/notificationService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ------------------ Multer Setup ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/resumes");
    fs.mkdirSync(uploadPath, { recursive: true }); // ensure folder exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});
const upload = multer({ storage });

// ------------------ Routes ------------------

/**
 * @route   POST /api/candidates
 * @desc    Add a new candidate (Admin, Recruiter Lead)
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRole(['Admin', 'Recruiter Lead']),
  upload.single('resume'),
  async (req, res) => {
    try {
      const { projectId, roleTitle, name, email, phone, interviewLevel } = req.body;

      if (!projectId || !roleTitle || !name || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const role = project.roles.find((r) => r.title === roleTitle);
      if (!role) {
        return res.status(400).json({ message: 'Role not found for this project' });
      }

      const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : undefined;

      const candidate = new Candidate({
        projectId,
        roleId: role._id,
        roleTitle,
        name,
        email,
        phone,
        resumePath,
        interviewLevel: interviewLevel || undefined,
        createdBy: req.user._id,
      });

      await candidate.save();
      return res.status(201).json(candidate);
    } catch (error) {
      console.error('❌ Error adding candidate:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);



/**
 * @route   GET /api/candidates/:projectId/overview
 * @desc    Project overview stats
 */
router.get(
  "/:projectId/overview",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Project Initiator", "Recruiter Lead", "Recruiter"]),
  async (req, res) => {
    const { projectId } = req.params;
    try {
      const candidates = await Candidate.find({ projectId });

      const interviewStats = {
        L1: { passed: 0, pending: 0, rejected: 0 },
        L2: { passed: 0, pending: 0, rejected: 0 },
        L3: { passed: 0, pending: 0, rejected: 0 },
        L4: { passed: 0, pending: 0, rejected: 0 },
        L5: { passed: 0, pending: 0, rejected: 0 },
        L6: { passed: 0, pending: 0, rejected: 0 },
      };
      const currentLevelStats = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0 };
      const roleStatsMap = {};

      candidates.forEach((candidate) => {
        const { roleTitle, feedback = [], interviewLevel } = candidate;

        if (interviewLevel && currentLevelStats[interviewLevel] !== undefined) {
          currentLevelStats[interviewLevel] += 1;
        }

        if (!roleStatsMap[roleTitle]) {
          roleStatsMap[roleTitle] = { total: 0, selected: 0, rejected: 0 };
        }

        roleStatsMap[roleTitle].total += 1;

        let hasRejected = false;

        feedback.forEach((fb) => {
          const { level, status } = fb;
          const lowerStatus = status?.toLowerCase();
          if (
            interviewStats[level] &&
            interviewStats[level][lowerStatus] !== undefined
          ) {
            interviewStats[level][lowerStatus] += 1;
          }
          if (status === "REJECTED") hasRejected = true;
        });

        const passedAll = ["L1", "L2", "L3", "L4", "L5", "L6"].every((level) =>
          feedback.find((fb) => fb.level === level && fb.status === "PASSED")
        );

        if (passedAll) roleStatsMap[roleTitle].selected += 1;
        else if (hasRejected) roleStatsMap[roleTitle].rejected += 1;
      });

      const roleStats = Object.entries(roleStatsMap).map(([title, stats]) => ({
        title,
        total: stats.total,
        selected: stats.selected,
        rejected: stats.rejected,
      }));

      res.json({ interviewStats, currentLevelStats, roles: roleStats });
    } catch (err) {
      console.error("Error fetching project overview:", err);
      res.status(500).json({ error: "Failed to fetch candidate stats" });
    }
  }
);

/**
 * @route   GET /api/candidates/:projectId
 * @desc    Get candidates by project
 */
router.get(
  "/:projectId",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Project Initiator", "Recruiter Lead", "Recruiter"]),
  async (req, res) => {
    try {
      const candidates = await Candidate.find({
        projectId: req.params.projectId,
      });
      res.json(candidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  }
);

/**
 * @route   GET /api/candidates/by-project-role/:projectId/:roleTitle
 * @desc    Get candidates by project + role
 */
router.get(
  "/by-project-role/:projectId/:roleTitle",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Project Initiator", "Recruiter Lead", "Recruiter"]),
  async (req, res) => {
    const { projectId, roleTitle } = req.params;
    try {
      const candidates = await Candidate.find({
        projectId,
        roleTitle: decodeURIComponent(roleTitle),
      });
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates by project and role:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  }
);

/**
 * @route   PUT /api/candidates/:id/interview-level
 * @desc    Update interview level
 */
router.put(
  "/:id/interview-level",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Recruiter Lead"]),
  async (req, res) => {
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
      console.error("Error updating interview level:", err);
      res.status(500).json({ error: "Failed to update interview level" });
    }
  }
);

/**
 * @route   GET /api/candidates/by-id/:id
 * @desc    Get candidate by ID
 */
router.get(
  "/by-id/:id",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Project Initiator", "Recruiter Lead", "Recruiter"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const candidate = await Candidate.findById(id);
      if (!candidate)
        return res.status(404).json({ message: "Candidate not found" });
      res.json(candidate);
    } catch (err) {
      console.error("Error fetching candidate by ID:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   PUT /api/candidates/:id/feedback
 * @desc    Save feedback
 */
router.put(
  "/:id/feedback",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Recruiter Lead", "Recruiter"]),
  async (req, res) => {
    const { id } = req.params;
    const { level, comment, status } = req.body;

    if (!level || !comment || !status) {
      return res.status(400).json({ error: "Missing feedback fields" });
    }

    try {
      const candidate = await Candidate.findById(id);
      if (!candidate)
        return res.status(404).json({ error: "Candidate not found" });

      const nextFeedback = [...(candidate.feedback || [])];
      const existingIndex = nextFeedback.findIndex((fb) => fb.level === level);
      if (existingIndex !== -1) {
        nextFeedback[existingIndex] = { level, comment, status };
      } else {
        nextFeedback.push({ level, comment, status });
      }

      const updatedCandidate = await Candidate.findByIdAndUpdate(
        id,
        { feedback: nextFeedback },
        { new: true, runValidators: false }
      );

      return res.json({
        message: "Feedback saved successfully",
        feedback: updatedCandidate.feedback,
      });
    } catch (err) {
      console.error("Error saving feedback:", err);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  }
);

/**
 * @route   GET /api/candidates/dashboard/:projectId
 * @desc    Dashboard stats per project
 */
router.get(
  "/dashboard/:projectId",
  passport.authenticate("jwt", { session: false }),
  checkRole(["Admin", "Project Initiator", "Recruiter Lead", "Recruiter"]),
  async (req, res) => {
    const { projectId } = req.params;

    try {
      const candidates = await Candidate.find({ projectId });

      const totalPositions = candidates.length;
      const selectedCount = candidates.filter((c) =>
        c.feedback.some((fb) => fb.status === "PASSED" && fb.level === "L6")
      ).length;

      const pipeline = {
        L1: 0,
        L2: 0,
        L3: 0,
        L4: 0,
        L5: 0,
        L6: 0,
        Selected: selectedCount,
      };

      candidates.forEach((c) => {
        if (c.interviewLevel && pipeline[c.interviewLevel] !== undefined) {
          pipeline[c.interviewLevel] += 1;
        }
      });

      res.json({
        totalPositions,
        filledPositions: selectedCount,
        pipeline,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  }
);

module.exports = router;
