const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification when a new project is created
   */
  static async notifyProjectCreated(project, userId) {
    try {
      await this.createNotification({
        type: 'PROJECT_CREATED',
        title: 'New Project Created',
        message: `Project "${project.projectName}" has been created successfully`,
        userId: userId,
        projectId: project._id,
        priority: 'MEDIUM'
      });
    } catch (error) {
      console.error('Error creating project notification:', error);
    }
  }

  /**
   * Create notification when a candidate is added
   */
  static async notifyCandidateAdded(candidate, project, userId) {
    try {
      await this.createNotification({
        type: 'CANDIDATE_ADDED',
        title: 'New Candidate Added',
        message: `Candidate "${candidate.name}" has been added to project "${project.projectName}"`,
        userId: userId,
        projectId: project._id,
        candidateId: candidate._id,
        priority: 'MEDIUM'
      });
    } catch (error) {
      console.error('Error creating candidate notification:', error);
    }
  }

  /**
   * Create notification when interview is completed
   */
  static async notifyInterviewCompleted(candidate, project, level, status, userId) {
    try {
      const statusText = status === 'PASSED' ? 'passed' : 'failed';
      await this.createNotification({
        type: 'INTERVIEW_COMPLETED',
        title: 'Interview Completed',
        message: `Candidate "${candidate.name}" ${statusText} ${level} interview for project "${project.projectName}"`,
        userId: userId,
        projectId: project._id,
        candidateId: candidate._id,
        priority: status === 'PASSED' ? 'MEDIUM' : 'LOW'
      });
    } catch (error) {
      console.error('Error creating interview notification:', error);
    }
  }

  /**
   * Create notification when project status changes
   */
  static async notifyProjectStatusChange(project, oldStatus, newStatus, userId) {
    try {
      await this.createNotification({
        type: 'PROJECT_UPDATED',
        title: 'Project Status Updated',
        message: `Project "${project.projectName}" status changed from ${oldStatus} to ${newStatus}`,
        userId: userId,
        projectId: project._id,
        priority: 'MEDIUM'
      });
    } catch (error) {
      console.error('Error creating status change notification:', error);
    }
  }

  /**
   * Create notification for deadline approaching
   */
  static async notifyDeadlineApproaching(project, daysUntilDeadline, userId) {
    try {
      const priority = daysUntilDeadline <= 3 ? 'HIGH' : daysUntilDeadline <= 7 ? 'MEDIUM' : 'LOW';
      await this.createNotification({
        type: 'DEADLINE_APPROACHING',
        title: 'Deadline Approaching',
        message: `Project "${project.projectName}" deadline is in ${daysUntilDeadline} day(s)`,
        userId: userId,
        projectId: project._id,
        priority: priority
      });
    } catch (error) {
      console.error('Error creating deadline notification:', error);
    }
  }

  /**
   * Create notification for role filled
   */
  static async notifyRoleFilled(project, roleTitle, userId) {
    try {
      await this.createNotification({
        type: 'ROLE_FILLED',
        title: 'Role Filled',
        message: `Role "${roleTitle}" in project "${project.projectName}" has been filled`,
        userId: userId,
        projectId: project._id,
        priority: 'MEDIUM'
      });
    } catch (error) {
      console.error('Error creating role filled notification:', error);
    }
  }

  /**
   * Create system maintenance notification
   */
  static async notifySystemMaintenance(message, userId) {
    try {
      await this.createNotification({
        type: 'SYSTEM_MAINTENANCE',
        title: 'System Maintenance',
        message: message,
        userId: userId,
        priority: 'HIGH'
      });
    } catch (error) {
      console.error('Error creating maintenance notification:', error);
    }
  }

  /**
   * Bulk create notifications for multiple users
   */
  static async bulkCreateNotification(notificationData, userIds) {
    try {
      const notifications = userIds.map(userId => ({
        ...notificationData,
        userId
      }));
      
      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;

