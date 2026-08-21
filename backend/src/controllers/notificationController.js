import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const getUserNotifications = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { role } = req.query;

    const query = {
      $or: [
        { recipient_id: user_id },
        { recipient_role: 'all' },
      ],
    };

    if (role) {
      query.$or.push({ recipient_role: role });
    }

    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const formatted = notifications.map((n) => ({
      id: n._id.toString(),
      recipient_id: n.recipient_id,
      recipient_role: n.recipient_role,
      notification_type: n.notification_type,
      title: n.title,
      message: n.message,
      blood_group: n.blood_group,
      request_id: n.request_id,
      is_read: n.is_read,
      created_at: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
    }));

    const unreadCount = formatted.filter((n) => !n.is_read).length;

    return res.status(200).json({
      unread_count: unreadCount,
      notifications: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { notification_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notification_id)) {
      throw new AppError('Invalid notification ID', 400);
    }

    const notification = await Notification.findByIdAndUpdate(
      notification_id,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      id: notification._id.toString(),
      is_read: true,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    await Notification.updateMany(
      { recipient_id: user_id, is_read: false },
      { is_read: true }
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { notification_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notification_id)) {
      throw new AppError('Invalid notification ID', 400);
    }

    const result = await Notification.deleteOne({ _id: notification_id });
    if (result.deletedCount === 0) {
      throw new AppError('Notification not found', 404);
    }

    return res.status(200).json({
      message: 'Notification removed',
      id: notification_id,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { recipient_id, recipient_role, notification_type, title, message, blood_group, request_id } = req.body;

    if (!title || !message) {
      throw new AppError('Title and message are required', 400);
    }

    const item = await Notification.create({
      recipient_id: recipient_id || 'all',
      recipient_role: recipient_role || 'all',
      notification_type: notification_type || 'system_alert',
      title,
      message,
      blood_group: blood_group || null,
      request_id: request_id || null,
      is_read: false,
    });

    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};
