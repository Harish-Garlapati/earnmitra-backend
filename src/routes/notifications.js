const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/authMiddleware');

// Ensure only authenticated partners access partner notifications
router.use(authenticate, (req, res, next) => {
  if (!req.user || !req.user.partnerId || req.user.actorType !== 'partner') {
    return res.status(403).json({ error: 'Partner access required', code: 'PARTNER_REQUIRED' });
  }
  next();
});

// GET /api/notifications — list partner notifications
router.get('/', async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const { limit, offset, unreadOnly } = req.query;
    const notifications = await notificationService.getNotifications(partnerId, {
      limit,
      offset,
      unreadOnly
    });
    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/notifications/unread-count — get number of unread notifications
router.get('/unread-count', async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const count = await notificationService.getUnreadCount(partnerId);
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read — mark single notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const notificationId = Number(req.params.id);
    if (!notificationId) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const updated = await notificationService.markAsRead(notificationId, partnerId);
    if (!updated) {
      return res.status(404).json({ error: 'Notification not found or already read' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all — mark all notifications as read
router.patch('/read-all', async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const updatedCount = await notificationService.markAllAsRead(partnerId);
    res.json({
      success: true,
      updatedCount,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
