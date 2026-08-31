class DonationHistoryModel {
  final String id;
  final String donorId;
  final String donorName;
  final String hospitalId;
  final String hospitalName;
  final String hospitalAddress;
  final String? bloodRequestId;
  final String? pledgeId;
  final String bloodGroup;
  final int units;
  final String donationDate;
  final String certificateId;
  final String status;
  final String? remarks;
  final String verificationHash;
  final String verifiedBy;

  DonationHistoryModel({
    required this.id,
    required this.donorId,
    required this.donorName,
    required this.hospitalId,
    required this.hospitalName,
    this.hospitalAddress = '',
    this.bloodRequestId,
    this.pledgeId,
    required this.bloodGroup,
    required this.units,
    required this.donationDate,
    required this.certificateId,
    this.status = 'verified',
    this.remarks,
    required this.verificationHash,
    required this.verifiedBy,
  });

  int get unitsDonated => units;

  factory DonationHistoryModel.fromJson(Map<String, dynamic> json) {
    String hospName = 'Medical Center';
    String hospAddr = '';
    String hospId = '';

    if (json['hospital_id'] is Map) {
      final h = json['hospital_id'] as Map;
      hospId = h['_id']?.toString() ?? h['id']?.toString() ?? '';
      hospName = h['hospital_name']?.toString() ?? 'Medical Center';
      hospAddr = h['address']?.toString() ?? '';
    } else {
      hospId = json['hospital_id']?.toString() ?? '';
      hospName = json['hospital_name']?.toString() ?? 'Medical Center';
      hospAddr = json['hospital_address']?.toString() ?? '';
    }

    String dId = '';
    if (json['donor_id'] is Map) {
      dId = json['donor_id']['_id']?.toString() ?? json['donor_id']['id']?.toString() ?? '';
    } else {
      dId = json['donor_id']?.toString() ?? '';
    }

    final parsedUnits = (json['units'] as num?)?.toInt() ??
        (json['units_donated'] as num?)?.toInt() ??
        1;

    final certId = json['certificate_id']?.toString() ?? 'LL-CERT-VERIFIED';

    return DonationHistoryModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      donorId: dId,
      donorName: json['donor_name']?.toString() ?? 'Verified Donor',
      hospitalId: hospId,
      hospitalName: hospName,
      hospitalAddress: hospAddr,
      bloodRequestId: json['blood_request_id']?.toString(),
      pledgeId: json['pledge_id']?.toString(),
      bloodGroup: json['blood_group']?.toString() ?? 'O+',
      units: parsedUnits,
      donationDate: json['donation_date']?.toString() ?? DateTime.now().toIso8601String(),
      certificateId: certId,
      status: json['status']?.toString() ?? 'verified',
      remarks: json['remarks']?.toString(),
      verificationHash: json['verification_hash']?.toString() ?? 'VERIFIED_CHAIN_${certId.hashCode.abs()}',
      verifiedBy: json['verified_by']?.toString() ?? hospName,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'donor_id': donorId,
      'donor_name': donorName,
      'hospital_id': hospitalId,
      'hospital_name': hospitalName,
      'hospital_address': hospitalAddress,
      'blood_request_id': bloodRequestId,
      'pledge_id': pledgeId,
      'blood_group': bloodGroup,
      'units': units,
      'donation_date': donationDate,
      'certificate_id': certificateId,
      'status': status,
      'remarks': remarks,
    };
  }
}
