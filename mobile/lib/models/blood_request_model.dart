class BloodRequestModel {
  final String id;
  final String hospitalId;
  final String hospitalName;
  final String hospitalPhone;
  final String emergencyContact;
  final String hospitalAddress;
  final double hospitalLatitude;
  final double hospitalLongitude;
  final String bloodGroup;
  final int unitsRequired;
  final String urgency; // 'normal' | 'urgent' | 'emergency'
  final String? patientName;
  final String? requiredBy;
  final String status; // 'searching' | 'fulfilled' | 'cancelled' | 'completed'
  final String createdAt;
  double? distanceKm;
  int? estimatedMins;
  int? matchScore;
  String? matchTier;
  String? matchLabel;

  BloodRequestModel({
    required this.id,
    required this.hospitalId,
    required this.hospitalName,
    required this.hospitalPhone,
    required this.emergencyContact,
    required this.hospitalAddress,
    required this.hospitalLatitude,
    required this.hospitalLongitude,
    required this.bloodGroup,
    required this.unitsRequired,
    required this.urgency,
    this.patientName,
    this.requiredBy,
    required this.status,
    required this.createdAt,
    this.distanceKm,
    this.estimatedMins,
    this.matchScore,
    this.matchTier,
    this.matchLabel,
  });

  factory BloodRequestModel.fromJson(Map<String, dynamic> json) {
    String hospId = '';
    String hospName = 'Medical Center';
    String hospPhone = '';
    String emergContact = '';
    String hospAddr = '';
    double hospLat = 0.0;
    double hospLng = 0.0;

    if (json['hospital_id'] is Map) {
      final h = json['hospital_id'] as Map;
      hospId = h['id']?.toString() ?? h['_id']?.toString() ?? '';
      hospName = h['hospital_name']?.toString() ?? 'Medical Center';
      hospPhone = h['phone']?.toString() ?? '';
      emergContact = h['emergency_contact']?.toString() ?? '';
      hospAddr = h['address']?.toString() ?? '';
      hospLat = (h['latitude'] as num?)?.toDouble() ?? 0.0;
      hospLng = (h['longitude'] as num?)?.toDouble() ?? 0.0;
    } else {
      hospId = json['hospital_id']?.toString() ?? '';
      hospName = json['hospital_name']?.toString() ?? 'Medical Center';
      hospPhone = json['hospital_phone']?.toString() ?? '';
      emergContact = json['emergency_contact']?.toString() ?? '';
      hospAddr = json['hospital_address']?.toString() ?? '';
      hospLat = (json['hospital_latitude'] as num?)?.toDouble() ?? 0.0;
      hospLng = (json['hospital_longitude'] as num?)?.toDouble() ?? 0.0;
    }

    return BloodRequestModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      hospitalId: hospId,
      hospitalName: hospName,
      hospitalPhone: hospPhone,
      emergencyContact: emergContact,
      hospitalAddress: hospAddr,
      hospitalLatitude: hospLat,
      hospitalLongitude: hospLng,
      bloodGroup: json['blood_group']?.toString() ?? 'O+',
      unitsRequired: (json['units_required'] as num?)?.toInt() ?? 1,
      urgency: json['urgency']?.toString() ?? 'normal',
      patientName: json['patient_name']?.toString(),
      requiredBy: json['required_by']?.toString(),
      status: json['status']?.toString() ?? 'searching',
      createdAt: json['created_at']?.toString() ?? DateTime.now().toIso8601String(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      estimatedMins: (json['estimatedMins'] as num?)?.toInt(),
      matchScore: (json['matchScore'] as num?)?.toInt(),
      matchTier: json['matchTier']?.toString(),
      matchLabel: json['matchLabel']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hospital_id': hospitalId,
      'blood_group': bloodGroup,
      'units_required': unitsRequired,
      'urgency': urgency,
      'patient_name': patientName,
      'required_by': requiredBy,
      'status': status,
    };
  }
}
