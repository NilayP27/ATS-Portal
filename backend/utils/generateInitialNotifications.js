const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const generateInitialNotifications = async () => {
  try {
    console.log('Generating initial notifications...');
    
    // Sample notifications for testing
    const sampleNotifications = [
      {
        type: 'SYSTEM_MAINTENANCE',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight at 10 PM',
        userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
        priority: 'HIGH'
      },
      {
        type: 'PROJECT_UPDATED',
        title: 'Project Status Updated',
        message: 'Project "Alpha" has been moved to ACTIVE status',
        userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
        priority: 'MEDIUM'
      },
      {
        type: 'DEADLINE_APPROACHING',
        title: 'Deadline Approaching',
        message: 'Project "Beta" deadline is in 5 days',
        userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
        priority: 'HIGH'
      }
    ];
    
    // Clear existing notifications
    await Notification.deleteMany({});
    
    // Insert sample notifications
    const result = await Notification.insertMany(sampleNotifications);
    
    console.log(`Generated ${result.length} initial notifications`);
    console.log('Sample notifications created successfully!');
    
  } catch (error) {
    console.error('Error generating notifications:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
generateInitialNotifications();

