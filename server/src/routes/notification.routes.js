'use strict';

const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth.middleware');
const { success, paginated } = require('../utils/apiResponse');

router.use(protect);

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return success(res, { notifications, unreadCount });
  } catch (e) { next(e); }
});

// PATCH /api/notifications/mark-read
router.patch('/mark-read', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
    return success(res, {}, 'Notifications marked as read');
  } catch (e) { next(e); }
});

module.exports = router;
