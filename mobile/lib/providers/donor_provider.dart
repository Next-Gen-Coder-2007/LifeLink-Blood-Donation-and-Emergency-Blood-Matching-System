import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../core/network_client.dart';
import '../core/blood_matching_engine.dart';
import '../core/distance_engine.dart';
import '../models/blood_request_model.dart';
import '../models/pledge_model.dart';
import '../models/history_model.dart';

class DonorProvider with ChangeNotifier {
  List<BloodRequestModel> _requests = [];
  List<DonationPledgeModel> _pledges = [];
  List<DonationHistoryModel> _history = [];
  bool _isLoading = false;
  String _filterMode = 'compatible'; // 'compatible' | 'exact' | 'urgent' | 'all'
  String _bloodGroupFilter = 'ALL';
  double _radiusFilter = 0; // 0 = Any Distance

  List<BloodRequestModel> get requests => _requests;
  List<DonationPledgeModel> get pledges => _pledges;
  List<DonationHistoryModel> get history => _history;
  bool get isLoading => _isLoading;
  String get filterMode => _filterMode;
  String get bloodGroupFilter => _bloodGroupFilter;
  double get radiusFilter => _radiusFilter;

  int get totalDonatedUnits =>
      _history.fold(0, (sum, item) => sum + item.unitsDonated);

  int get totalLivesSaved => totalDonatedUnits * 3;

  void setFilterMode(String mode) {
    _filterMode = mode;
    notifyListeners();
  }

  void setBloodGroupFilter(String group) {
    _bloodGroupFilter = group;
    notifyListeners();
  }

  void setRadiusFilter(double radius) {
    _radiusFilter = radius;
    notifyListeners();
  }

  Future<void> loadDonorData({
    required String? donorId,
    required String donorGroup,
    required double donorLat,
    required double donorLng,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final futures = <Future<dynamic>>[
        NetworkClient.get(ApiConfig.bloodRequests),
      ];

      if (donorId != null && donorId.isNotEmpty) {
        futures.add(NetworkClient.get(ApiConfig.donationPledgesByDonor(donorId)).catchError((_) => []));
        futures.add(NetworkClient.get(ApiConfig.donationHistoryByDonor(donorId)).catchError((_) => []));
      }

      final results = await Future.wait(futures);

      if (results[0] is List) {
        final rawList = results[0] as List;
        _requests = rawList
            .map((json) => BloodRequestModel.fromJson(Map<String, dynamic>.from(json)))
            .where((r) => r.status == 'searching')
            .map((r) {
              final distance = DistanceEngine.calculateHaversineDistance(
                donorLat,
                donorLng,
                r.hospitalLatitude,
                r.hospitalLongitude,
              );
              final time = DistanceEngine.calculateTravelTimeMinutes(distance, mode: 'emergency');
              final match = BloodMatchingEngine.evaluateBloodMatch(donorGroup, r.bloodGroup);

              r.distanceKm = distance;
              r.estimatedMins = time;
              r.matchScore = match.score;
              r.matchTier = match.tier;
              r.matchLabel = match.label;
              return r;
            })
            .toList();
      }

      if (results.length > 1 && results[1] is List) {
        final rawPledges = results[1] as List;
        _pledges = rawPledges
            .map((json) => DonationPledgeModel.fromJson(Map<String, dynamic>.from(json)))
            .toList();
      }

      if (results.length > 2) {
        if (results[2] is Map && results[2]['donations'] is List) {
          final rawHist = results[2]['donations'] as List;
          _history = rawHist
              .map((json) => DonationHistoryModel.fromJson(Map<String, dynamic>.from(json)))
              .toList();
        } else if (results[2] is List) {
          final rawHist = results[2] as List;
          _history = rawHist
              .map((json) => DonationHistoryModel.fromJson(Map<String, dynamic>.from(json)))
              .toList();
        }
      }
    } catch (_) {
      // Handled
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<BloodRequestModel> getFilteredRequests(String donorGroup) {
    return _requests.where((r) {
      // Blood Match Mode Filter
      if (_filterMode == 'compatible') {
        if (!BloodMatchingEngine.isBloodCompatible(donorGroup, r.bloodGroup)) return false;
      } else if (_filterMode == 'exact') {
        if (r.bloodGroup != donorGroup) return false;
      } else if (_filterMode == 'urgent') {
        if (r.urgency != 'emergency' && r.urgency != 'urgent') return false;
        if (!BloodMatchingEngine.isBloodCompatible(donorGroup, r.bloodGroup)) return false;
      }

      // Group Selector
      if (_bloodGroupFilter != 'ALL' && r.bloodGroup != _bloodGroupFilter) {
        return false;
      }

      // Radius Filter
      if (_radiusFilter > 0 && r.distanceKm != null && r.distanceKm! > _radiusFilter) {
        return false;
      }

      return true;
    }).toList()
      ..sort((a, b) {
        const weights = {'emergency': 3, 'urgent': 2, 'normal': 1};
        final uA = weights[a.urgency] ?? 0;
        final uB = weights[b.urgency] ?? 0;
        if (uB != uA) return uB.compareTo(uA);
        return (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999);
      });
  }

  Future<void> submitPledge({
    required String requestId,
    required String hospitalId,
    required String donorId,
    required String donorUserId,
    required String donorName,
    required String donorPhone,
    required String bloodGroup,
    String? estimatedArrival,
    String? notes,
  }) async {
    final body = {
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

    await NetworkClient.post(ApiConfig.donationPledges, body: body);
  }

  Future<void> cancelPledge(String pledgeId) async {
    await NetworkClient.put(ApiConfig.donationPledgeById(pledgeId), body: {
      'status': 'cancelled',
    });
    _pledges.removeWhere((p) => p.id == pledgeId);
    notifyListeners();
  }
}
