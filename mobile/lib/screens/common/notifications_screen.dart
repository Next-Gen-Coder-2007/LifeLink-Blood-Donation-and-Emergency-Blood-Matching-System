import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final notifProvider = context.watch<NotificationProvider>();
    final notifications = notifProvider.notifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications & Alerts'),
        actions: [
          if (notifProvider.unreadCount > 0 && auth.user != null)
            TextButton(
              onPressed: () => notifProvider.markAllAsRead(auth.user!.id),
              child: const Text('Mark All Read', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          if (auth.user != null) {
            await notifProvider.fetchNotifications(auth.user!.id, role: auth.user!.role);
          }
        },
        child: notifications.isEmpty
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.bellOff, size: 44, color: AppTheme.slate300),
                    SizedBox(height: 12),
                    Text(
                      'No Notifications Yet',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.slate900),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Emergency matches and donation confirmations will appear here.',
                      style: TextStyle(fontSize: 12, color: AppTheme.slate500),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: notifications.length,
                itemBuilder: (ctx, i) {
                  final notif = notifications[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: notif.isRead ? Colors.white : AppTheme.primaryRedLight.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: notif.isRead ? AppTheme.slate200 : const Color(0xFFFECACA),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: notif.isRead ? AppTheme.slate100 : AppTheme.primaryRedLight,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            notif.notificationType.contains('emergency') || notif.notificationType.contains('direct')
                                ? LucideIcons.alertTriangle
                                : LucideIcons.bell,
                            size: 18,
                            color: notif.isRead ? AppTheme.slate600 : AppTheme.primaryRed,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      notif.title,
                                      style: TextStyle(
                                        fontWeight: notif.isRead ? FontWeight.w700 : FontWeight.w900,
                                        fontSize: 13,
                                        color: AppTheme.slate900,
                                      ),
                                    ),
                                  ),
                                  if (!notif.isRead)
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: const BoxDecoration(
                                        color: AppTheme.primaryRed,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                notif.message,
                                style: const TextStyle(fontSize: 12, color: AppTheme.slate600, height: 1.4),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text(
                                    notif.createdAt.split('T')[0],
                                    style: const TextStyle(fontSize: 10, color: AppTheme.slate400),
                                  ),
                                  const Spacer(),
                                  if (!notif.isRead)
                                    InkWell(
                                      onTap: () => notifProvider.markAsRead(notif.id),
                                      child: const Text('Mark Read', style: TextStyle(color: AppTheme.medicalBlue, fontSize: 11, fontWeight: FontWeight.w800)),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
