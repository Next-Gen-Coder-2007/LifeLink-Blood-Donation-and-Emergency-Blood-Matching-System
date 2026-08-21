class DonationHistoryModel {
  final String id;
  final String donorId;
  final String donorName;
  final String hospitalId;
  final String hospitalName;
  final String? pledgeId;
  final String bloodGroup;
  final int unitsDonated;
  final String donationDate;
  final String certificateId;
  final String verificationHash;
  final String verifiedBy;

  DonationHistoryModel({
    required this.id,
    required this.donorId,
    required this.donorName,
    required this.hospitalId,
    required this.hospitalName,
    this.pledgeId,
    required this.bloodGroup,
    required this.unitsDonated,
    required this.donationDate,
    required this.certificateId,
    required this.verificationHash,
    required this.verifiedBy,
  });

  factory DonationHistoryModel.fromJson(Map<String, dynamic> json) {
    String hospName = 'Medical Center';
    if (json['hospital_id'] is Map) {
      hospName = json['hospital_id']['hospital_name']?.toString() ?? 'Medical Center';
    } else {
      hospName = json['hospital_name']?.toString() ?? 'Medical Center';
    }

    return DonationHistoryModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      donorId: json['donor_id'] is Map ? (json['donor_id']['_id']?.toString() ?? '') : (json['donor_id']?.toString() ?? ''),
      donorName: json['donor_name']?.toString() ?? 'Verified Donor',
      hospitalId: json['hospital_id'] is Map ? (json['hospital_id']['_id']?.toString() ?? '') : (json['hospital_id']?.toString() ?? ''),
      hospitalName: hospName,
      pledgeId: json['pledge_id']?.toString(),
      bloodGroup: json['blood_group']?.toString() ?? 'O+',
      unitsDonated: (json['units_donated'] as num?)?.toInt() ?? 1,
      donationDate: json['donation_date']?.toString() ?? DateTime.now().toIso8601String(),
      certificateId: json['certificate_id']?.toString() ?? 'LL-CERT-VERIFIED',
      verificationHash: json['verification_hash']?.toString() ?? 'VERIFIED_CHAIN',
      verifiedBy: json['verified_by']?.toString() ?? 'Hospital Staff',
    );
  }
}
