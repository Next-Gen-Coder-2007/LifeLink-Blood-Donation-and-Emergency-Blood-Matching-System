import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../core/network_client.dart';
import '../core/distance_engine.dart';
import '../models/blood_request_model.dart';
import '../models/pledge_model.dart';
import '../models/donor_model.dart';

class HospitalProvider with ChangeNotifier {
  List<BloodRequestModel> _hospitalRequests = [];
  List<DonationPledgeModel> _hospitalPledges = [];
  List<DonorModel> _nearbyDonors = [];
  Map<String, int> _inventory = {};
  bool _isLoading = false;

  List<BloodRequestModel> get hospitalRequests => _hospitalRequests;
  List<DonationPledgeModel> get hospitalPledges => _hospitalPledges;
  List<DonorModel> get nearbyDonors => _nearbyDonors;
  Map<String, int> get inventory => _inventory;
  bool get isLoading => _isLoading;

  int get totalStockUnits => _inventory.values.fold(0, (sum, val) => sum + val);

  Future<void> loadHospitalData({
    required String hospitalId,
    required double hospitalLat,
    required double hospitalLng,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        NetworkClient.get(ApiConfig.bloodRequestsByHospital(hospitalId)).catchError((_) => []),
        NetworkClient.get(ApiConfig.donationPledgesByHospital(hospitalId)).catchError((_) => []),
        NetworkClient.get(ApiConfig.donors).catchError((_) => []),
        NetworkClient.get(ApiConfig.bloodInventoryByHospital(hospitalId)).catchError((_) => {}),
      ]);

      if (results[0] is List) {
        final rawReqs = results[0] as List;
        _hospitalRequests = rawReqs
            .map((json) => BloodRequestModel.fromJson(Map<String, dynamic>.from(json)))
            .toList();
      }

      if (results[1] is List) {
        final rawPledges = results[1] as List;
        _hospitalPledges = rawPledges
            .map((json) => DonationPledgeModel.fromJson(Map<String, dynamic>.from(json)))
            .toList();
      }

      if (results[2] is List) {
        final rawDonors = results[2] as List;
        _nearbyDonors = rawDonors
            .map((json) => DonorModel.fromJson(Map<String, dynamic>.from(json)))
            .map((d) {
              final distance = DistanceEngine.calculateHaversineDistance(
                hospitalLat,
                hospitalLng,
                d.latitude,
                d.longitude,
              );
              final time = DistanceEngine.calculateTravelTimeMinutes(distance, mode: 'emergency');
              d.distanceKm = distance;
              d.estimatedMins = time;
              return d;
            })
            .toList()
          ..sort((a, b) => (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999));
      }

      if (results[3] is Map) {
        final rawInv = results[3] as Map;
        final invMap = <String, int>{};
        if (rawInv['inventory'] is List) {
          for (final item in rawInv['inventory']) {
            if (item is Map && item['blood_group'] != null) {
              invMap[item['blood_group'].toString()] = (item['units'] as num?)?.toInt() ?? 0;
            }
          }
        }
        _inventory = invMap;
      }
    } catch (_) {
      // Handled
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createBloodRequest({
    required String hospitalId,
    required String bloodGroup,
    required int unitsRequired,
    required String urgency,
    String? patientName,
    String? requiredBy,
  }) async {
    final body = {
      'hospital_id': hospitalId,
      'blood_group': bloodGroup,
      'units_required': unitsRequired,
      'urgency': urgency,
      'patient_name': patientName,
      'required_by': requiredBy,
    };

    await NetworkClient.post(ApiConfig.bloodRequests, body: body);
  }

  Future<void> fulfillRequest(String requestId) async {
    await NetworkClient.put(ApiConfig.bloodRequestById(requestId), body: {
      'status': 'fulfilled',
    });
    final index = _hospitalRequests.indexWhere((r) => r.id == requestId);
    if (index != -1) {
      final old = _hospitalRequests[index];
      _hospitalRequests[index] = BloodRequestModel(
        id: old.id,
        hospitalId: old.hospitalId,
        hospitalName: old.hospitalName,
        hospitalPhone: old.hospitalPhone,
        emergencyContact: old.emergencyContact,
        hospitalAddress: old.hospitalAddress,
        hospitalLatitude: old.hospitalLatitude,
        hospitalLongitude: old.hospitalLongitude,
        bloodGroup: old.bloodGroup,
        unitsRequired: old.unitsRequired,
        urgency: old.urgency,
        patientName: old.patientName,
        requiredBy: old.requiredBy,
        status: 'fulfilled',
        createdAt: old.createdAt,
      );
      notifyListeners();
    }
  }

  Future<void> verifyDonationPledge({
    required String pledgeId,
    required String hospitalId,
    required String donorId,
    required String donorName,
    required String bloodGroup,
    required int unitsDonated,
    required String verifiedBy,
    String? notes,
  }) async {
    final body = {
      'pledge_id': pledgeId,
      'hospital_id': hospitalId,
      'donor_id': donorId,
      'donor_name': donorName,
      'blood_group': bloodGroup,
      'units_donated': unitsDonated,
      'verified_by': verifiedBy,
      'notes': notes,
    };

    await NetworkClient.post(ApiConfig.donationHistory, body: body);
  }

  Future<void> dispatchDirectDirective({
    required String donorId,
    required String hospitalId,
    required String message,
    required int unitsNeeded,
    required String urgency,
  }) async {
    final body = {
      'hospital_id': hospitalId,
      'message': message,
      'units_needed': unitsNeeded,
      'urgency': urgency,
    };

    await NetworkClient.post(ApiConfig.directRequest(donorId), body: body);
  }

  Future<void> updateInventoryUnit({
    required String hospitalId,
    required String bloodGroup,
    required int newUnits,
  }) async {
    await NetworkClient.put(ApiConfig.bloodInventoryByHospital(hospitalId), body: {
      'blood_group': bloodGroup,
      'units': newUnits,
    });
    _inventory[bloodGroup] = newUnits;
    notifyListeners();
  }
}
