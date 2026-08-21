class DonationPledgeModel {
  final String id;
  final String requestId;
  final String hospitalId;
  final String hospitalName;
  final String hospitalPhone;
  final String hospitalAddress;
  final String donorId;
  final String donorUserId;
  final String donorName;
  final String donorPhone;
  final String bloodGroup;
  final String status; // 'pledged' | 'acknowledged' | 'fulfilled' | 'cancelled'
  final String? estimatedArrival;
  final String? notes;
  final String createdAt;

  DonationPledgeModel({
    required this.id,
    required this.requestId,
    required this.hospitalId,
    required this.hospitalName,
    required this.hospitalPhone,
    required this.hospitalAddress,
    required this.donorId,
    required this.donorUserId,
    required this.donorName,
    required this.donorPhone,
    required this.bloodGroup,
    required this.status,
    this.estimatedArrival,
    this.notes,
    required this.createdAt,
  });

  factory DonationPledgeModel.fromJson(Map<String, dynamic> json) {
    String hospId = '';
    String hospName = 'Medical Center';
    String hospPhone = '';
    String hospAddr = '';

    if (json['hospital_id'] is Map) {
      final h = json['hospital_id'] as Map;
      hospId = h['id']?.toString() ?? h['_id']?.toString() ?? '';
      hospName = h['hospital_name']?.toString() ?? 'Medical Center';
      hospPhone = h['phone']?.toString() ?? '';
      hospAddr = h['address']?.toString() ?? '';
    } else {
      hospId = json['hospital_id']?.toString() ?? '';
      hospName = json['hospital_name']?.toString() ?? 'Medical Center';
      hospPhone = json['hospital_phone']?.toString() ?? '';
      hospAddr = json['hospital_address']?.toString() ?? '';
    }

    return DonationPledgeModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      requestId: json['request_id']?.toString() ?? '',
      hospitalId: hospId,
      hospitalName: hospName,
      hospitalPhone: hospPhone,
      hospitalAddress: hospAddr,
      donorId: json['donor_id']?.toString() ?? '',
      donorUserId: json['donor_user_id']?.toString() ?? '',
      donorName: json['donor_name']?.toString() ?? 'Volunteer Donor',
      donorPhone: json['donor_phone']?.toString() ?? '',
      bloodGroup: json['blood_group']?.toString() ?? 'O+',
      status: json['status']?.toString() ?? 'pledged',
      estimatedArrival: json['estimated_arrival']?.toString(),
      notes: json['notes']?.toString(),
      createdAt: json['created_at']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'request_id': requestId,
      'hospital_id': hospitalId,
      'donor_id': donorId,
      'donor_user_id': donorUserId,
      'donor_name': donorName,
      'donor_phone': donorPhone,
      'blood_group': bloodGroup,
      'estimated_arrival': estimatedArrival,
      'notes': notes,
    };
  }
}
