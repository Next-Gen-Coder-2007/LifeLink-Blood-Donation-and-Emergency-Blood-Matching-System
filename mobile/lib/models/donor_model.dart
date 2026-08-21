class DonorModel {
  final String id;
  final String userId;
  final String donorName;
  final String bloodGroup;
  final String phone;
  final String address;
  final double latitude;
  final double longitude;
  final bool availability;
  final String? lastDonationDate;
  final String? createdAt;
  double? distanceKm;
  int? estimatedMins;

  DonorModel({
    required this.id,
    required this.userId,
    required this.donorName,
    required this.bloodGroup,
    required this.phone,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.availability,
    this.lastDonationDate,
    this.createdAt,
    this.distanceKm,
    this.estimatedMins,
  });

  factory DonorModel.fromJson(Map<String, dynamic> json) {
    return DonorModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      userId: json['user_id'] is Map
          ? (json['user_id']['_id']?.toString() ?? json['user_id']['id']?.toString() ?? '')
          : (json['user_id']?.toString() ?? ''),
      donorName: json['donor_name']?.toString() ??
          (json['user_id'] is Map ? json['user_id']['name']?.toString() : null) ??
          'Volunteer Donor',
      bloodGroup: json['blood_group']?.toString() ?? 'O+',
      phone: json['phone']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      availability: json['availability'] == true,
      lastDonationDate: json['last_donation_date']?.toString(),
      createdAt: json['created_at']?.toString(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      estimatedMins: (json['estimatedMins'] as num?)?.toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'donor_name': donorName,
      'blood_group': bloodGroup,
      'phone': phone,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'availability': availability,
      'last_donation_date': lastDonationDate,
    };
  }
}
