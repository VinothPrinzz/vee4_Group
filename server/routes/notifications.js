// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this import
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/v1/notifications
// @desc    Get notifications for the current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/v1/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    console.log('Marking notification as read:', notificationId); // Debug log
    console.log('User ID:', req.user._id); // Debug log
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      console.log('Notification not found:', notificationId);
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access - Notification userId:', notification.userId, 'User ID:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification',
      });
    }
    
    // Mark as read
    notification.isRead = true;
    await notification.save();
    
    console.log('Notification marked as read successfully:', notificationId);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read',
    });
  }
});

// @route   PUT /api/v1/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    console.log('Marking all notifications as read for user:', req.user._id);
    
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    console.log('Mark all as read result:', result);
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark all notifications as read',
    });
  }
});

module.exports = router;