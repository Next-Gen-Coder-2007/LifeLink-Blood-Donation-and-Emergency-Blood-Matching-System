class HospitalModel {
  final String id;
  final String userId;
  final String hospitalName;
  final String phone;
  final String emergencyContact;
  final String address;
  final double latitude;
  final double longitude;
  final Map<String, int>? bloodStock;
  final int? totalUnits;
  final int? searchingRequestsCount;
  double? distanceKm;
  int? estimatedMins;

  HospitalModel({
    required this.id,
    required this.userId,
    required this.hospitalName,
    required this.phone,
    required this.emergencyContact,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.bloodStock,
    this.totalUnits,
    this.searchingRequestsCount,
    this.distanceKm,
    this.estimatedMins,
  });

  factory HospitalModel.fromJson(Map<String, dynamic> json) {
    Map<String, int>? stock;
    if (json['blood_stock'] is Map) {
      stock = (json['blood_stock'] as Map).map(
        (key, value) => MapEntry(key.toString(), (value as num?)?.toInt() ?? 0),
      );
    }

    return HospitalModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      hospitalName: json['hospital_name']?.toString() ?? 'Medical Facility',
      phone: json['phone']?.toString() ?? '',
      emergencyContact: json['emergency_contact']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      bloodStock: stock,
      totalUnits: (json['total_units'] as num?)?.toInt(),
      searchingRequestsCount: (json['searching_requests_count'] as num?)?.toInt(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      estimatedMins: (json['estimatedMins'] as num?)?.toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'hospital_name': hospitalName,
      'phone': phone,
      'emergency_contact': emergencyContact,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
