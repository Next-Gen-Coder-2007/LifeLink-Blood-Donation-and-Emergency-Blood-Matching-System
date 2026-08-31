import 'dart:async';
import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../core/network_client.dart';
import '../models/notification_model.dart';

class NotificationProvider with ChangeNotifier {
  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  Timer? _pollingTimer;
  String? _activeUserId;
  String? _activeRole;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  List<NotificationModel> get unreadNotifications =>
      _notifications.where((n) => !n.isRead).toList();

  List<NotificationModel> get emergencyAlerts => _notifications.where((n) =>
      n.notificationType.contains('emergency') ||
      n.notificationType.contains('direct') ||
      n.notificationType.contains('urgent')).toList();

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }

  void startPolling(String userId, {String? role}) {
    _activeUserId = userId;
    _activeRole = role;
    _pollingTimer?.cancel();
    // Initial fetch
    fetchNotifications(userId, role: role, isBackground: true);
    // Poll every 15 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (_activeUserId != null && _activeUserId!.isNotEmpty) {
        fetchNotifications(_activeUserId!, role: _activeRole, isBackground: true);
      }
    });
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _activeUserId = null;
    _activeRole = null;
  }

  Future<void> fetchNotifications(String userId, {String? role, bool isBackground = false}) async {
    if (!isBackground) {
      _isLoading = true;
      notifyListeners();
    }

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
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    } finally {
      if (!isBackground) {
        _isLoading = false;
      }
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
      final item = _notifications.firstWhere((n) => n.id == notificationId, orElse: () => _notifications.first);
      if (!item.isRead && _unreadCount > 0) {
        _unreadCount--;
      }
      _notifications.removeWhere((n) => n.id == notificationId);
      notifyListeners();
    } catch (_) {}
  }
}
