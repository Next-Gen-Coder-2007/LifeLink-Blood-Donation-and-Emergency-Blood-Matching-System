import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';
import '../../models/notification_model.dart';
import '../donor/donor_requests_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'all'; // 'all' | 'unread' | 'emergency' | 'transfusion'

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final notifProvider = context.watch<NotificationProvider>();
    final allNotifications = notifProvider.notifications;

    final filtered = allNotifications.where((n) {
      if (_selectedFilter == 'unread') return !n.isRead;
      if (_selectedFilter == 'emergency') {
        return n.notificationType.contains('emergency') ||
            n.notificationType.contains('direct') ||
            n.notificationType.contains('urgent');
      }
      if (_selectedFilter == 'transfusion') {
        return n.notificationType.contains('donation') ||
            n.notificationType.contains('verified') ||
            n.notificationType.contains('pledge');
      }
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications & Alerts'),
        actions: [
          if (notifProvider.unreadCount > 0 && auth.user != null)
            TextButton.icon(
              onPressed: () => notifProvider.markAllAsRead(auth.user!.id),
              icon: const Icon(LucideIcons.checkCheck, size: 16, color: AppTheme.medicalBlue),
              label: const Text(
                'Mark All Read',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppTheme.medicalBlue),
              ),
            ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: AppTheme.slate200)),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', 'All (${allNotifications.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('unread', 'Unread (${notifProvider.unreadCount})', isUnread: true),
                  const SizedBox(width: 8),
                  _buildFilterChip('emergency', 'Emergency Alerts', isEmergency: true),
                  const SizedBox(width: 8),
                  _buildFilterChip('transfusion', 'Transfusions & Pledges'),
                ],
              ),
            ),
          ),

          // Notification List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                if (auth.user != null) {
                  await notifProvider.fetchNotifications(auth.user!.id, role: auth.user!.role);
                }
              },
              child: filtered.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                color: AppTheme.slate100,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.bellOff, size: 36, color: AppTheme.slate400),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              _selectedFilter == 'unread'
                                  ? 'No Unread Notifications'
                                  : 'No Notifications Found',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.slate900),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Emergency blood match alerts, hospital directives, and donation certificates will show up here in real time.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      itemBuilder: (ctx, i) {
                        final notif = filtered[i];
                        return _buildNotificationCard(context, notif, notifProvider, auth);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, {bool isUnread = false, bool isEmergency = false}) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => setState(() => _selectedFilter = key),
      selectedColor: isEmergency ? AppTheme.primaryRed : AppTheme.slate900,
      backgroundColor: AppTheme.slate50,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : (isEmergency ? AppTheme.primaryRed : AppTheme.slate700),
        fontSize: 11,
        fontWeight: FontWeight.w800,
      ),
      side: BorderSide(
        color: isSelected
            ? (isEmergency ? AppTheme.primaryRed : AppTheme.slate900)
            : AppTheme.slate200,
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    NotificationModel notif,
    NotificationProvider notifProvider,
    AuthProvider auth,
  ) {
    final isEmergency = notif.notificationType.contains('emergency') ||
        notif.notificationType.contains('direct') ||
        notif.notificationType.contains('urgent');
    final isVerified = notif.notificationType.contains('donation') || notif.notificationType.contains('verified');

    return Dismissible(
      key: Key(notif.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: AppTheme.primaryRed,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(LucideIcons.trash2, color: Colors.white, size: 20),
      ),
      onDismissed: (_) {
        notifProvider.deleteNotification(notif.id);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: notif.isRead
              ? Colors.white
              : (isEmergency ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: notif.isRead
                ? AppTheme.slate200
                : (isEmergency ? const Color(0xFFFECACA) : const Color(0xFFE2E8F0)),
            width: notif.isRead ? 1 : 1.5,
          ),
          boxShadow: [
            if (!notif.isRead)
              BoxShadow(
                color: (isEmergency ? AppTheme.primaryRed : AppTheme.medicalBlue).withValues(alpha: 0.06),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
          ],
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (!notif.isRead) {
              notifProvider.markAsRead(notif.id);
            }
            if (isEmergency && auth.isDonor) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const DonorRequestsScreen()));
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isEmergency
                        ? AppTheme.primaryRedLight
                        : (isVerified ? AppTheme.medicalEmeraldLight : AppTheme.slate100),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    isEmergency
                        ? LucideIcons.alertTriangle
                        : (isVerified ? LucideIcons.award : LucideIcons.bell),
                    size: 18,
                    color: isEmergency
                        ? AppTheme.primaryRed
                        : (isVerified ? AppTheme.medicalEmerald : AppTheme.slate700),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          if (notif.bloodGroup != null && notif.bloodGroup!.isNotEmpty) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              margin: const EdgeInsets.only(right: 6),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryRed,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                notif.bloodGroup!,
                                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                              ),
                            ),
                          ],
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
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: isEmergency ? AppTheme.primaryRed : AppTheme.medicalBlue,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        notif.message,
                        style: const TextStyle(fontSize: 12, color: AppTheme.slate600, height: 1.4),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Icon(LucideIcons.clock, size: 12, color: AppTheme.slate400),
                          const SizedBox(width: 4),
                          Text(
                            notif.createdAt.split('T')[0],
                            style: const TextStyle(fontSize: 10, color: AppTheme.slate400, fontWeight: FontWeight.w600),
                          ),
                          const Spacer(),
                          if (!notif.isRead)
                            TextButton(
                              onPressed: () => notifProvider.markAsRead(notif.id),
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.zero,
                                minimumSize: const Size(40, 20),
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: const Text(
                                'Mark Read',
                                style: TextStyle(color: AppTheme.medicalBlue, fontSize: 11, fontWeight: FontWeight.w800),
                              ),
                            ),
                          IconButton(
                            icon: const Icon(LucideIcons.trash2, size: 14, color: AppTheme.slate300),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => notifProvider.deleteNotification(notif.id),
                            tooltip: 'Delete notification',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
