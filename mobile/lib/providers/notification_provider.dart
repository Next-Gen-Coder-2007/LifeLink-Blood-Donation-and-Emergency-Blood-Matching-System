import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../core/network_client.dart';
import '../models/notification_model.dart';

class NotificationProvider with ChangeNotifier {
  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  Future<void> fetchNotifications(String userId, {String? role}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await NetworkClient.get(ApiConfig.notificationsByUser(userId, role: role));
      if (res is Map) {
        _unreadCount = (res['unread_count'] as num?)?.toInt() ?? 0;
        if (res['notifications'] is List) {
          final list = res['notifications'] as List;
          _notifications = list
              .map((json) => NotificationModel.fromJson(Map<String, dynamic>.from(json)))
              .toList();
        }
      }
    } catch (_) {
      // Handled
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await NetworkClient.put(ApiConfig.markNotificationRead(notificationId));
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        final old = _notifications[index];
        _notifications[index] = NotificationModel(
          id: old.id,
          recipientId: old.recipientId,
          recipientRole: old.recipientRole,
          notificationType: old.notificationType,
          title: old.title,
          message: old.message,
          bloodGroup: old.bloodGroup,
          requestId: old.requestId,
          isRead: true,
          createdAt: old.createdAt,
        );
        if (_unreadCount > 0) _unreadCount--;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> markAllAsRead(String userId) async {
    try {
      await NetworkClient.put(ApiConfig.markAllNotificationsRead(userId));
      _notifications = _notifications
          .map((n) => NotificationModel(
                id: n.id,
                recipientId: n.recipientId,
                recipientRole: n.recipientRole,
                notificationType: n.notificationType,
                title: n.title,
                message: n.message,
                bloodGroup: n.bloodGroup,
                requestId: n.requestId,
                isRead: true,
                createdAt: n.createdAt,
              ))
          .toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await NetworkClient.delete(ApiConfig.deleteNotification(notificationId));
      _notifications.removeWhere((n) => n.id == notificationId);
      notifyListeners();
    } catch (_) {}
  }
}
