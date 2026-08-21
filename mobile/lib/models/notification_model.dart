class NotificationModel {
  final String id;
  final String recipientId;
  final String recipientRole;
  final String notificationType;
  final String title;
  final String message;
  final String? bloodGroup;
  final String? requestId;
  final bool isRead;
  final String createdAt;

  NotificationModel({
    required this.id,
    required this.recipientId,
    required this.recipientRole,
    required this.notificationType,
    required this.title,
    required this.message,
    this.bloodGroup,
    this.requestId,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      recipientId: json['recipient_id']?.toString() ?? '',
      recipientRole: json['recipient_role']?.toString() ?? 'donor',
      notificationType: json['notification_type']?.toString() ?? 'alert',
      title: json['title']?.toString() ?? 'Alert',
      message: json['message']?.toString() ?? '',
      bloodGroup: json['blood_group']?.toString(),
      requestId: json['request_id']?.toString(),
      isRead: json['is_read'] == true,
      createdAt: json['created_at']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }
}
