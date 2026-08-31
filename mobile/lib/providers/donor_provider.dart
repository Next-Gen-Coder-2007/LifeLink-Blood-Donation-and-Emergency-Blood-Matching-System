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

  // Donor Impact Stats from backend
  int _totalDonations = 0;
  int _totalUnits = 0;
  int _livesSaved = 0;
  String _heroTier = 'New Lifesaver';
  int? _daysSinceLastDonation;
  String? _lastDonationDate;

  List<BloodRequestModel> get requests => _requests;
  List<DonationPledgeModel> get pledges => _pledges;
  List<DonationHistoryModel> get history => _history;
  bool get isLoading => _isLoading;
  String get filterMode => _filterMode;
  String get bloodGroupFilter => _bloodGroupFilter;
  double get radiusFilter => _radiusFilter;

  int get totalDonations => _totalDonations > 0 ? _totalDonations : _history.length;
  int get totalDonatedUnits => _totalUnits > 0
      ? _totalUnits
      : _history.fold(0, (sum, item) => sum + item.units);
  int get totalLivesSaved => _livesSaved > 0 ? _livesSaved : totalDonatedUnits * 3;
  String get heroTier => _heroTier;
  int? get daysSinceLastDonation => _daysSinceLastDonation;
  String? get lastDonationDate => _lastDonationDate;

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
        NetworkClient.get(ApiConfig.bloodRequests).catchError((e) {
          debugPrint('Error loading blood requests: $e');
          return [];
        }),
      ];

      if (donorId != null && donorId.isNotEmpty) {
        futures.add(NetworkClient.get(ApiConfig.donationPledgesByDonor(donorId)).catchError((e) {
          debugPrint('Error loading pledges: $e');
          return [];
        }));
        futures.add(NetworkClient.get(ApiConfig.donationHistoryByDonor(donorId)).catchError((e) {
          debugPrint('Error loading history: $e');
          return null;
        }));
      }

      final results = await Future.wait(futures);

      // 1. Blood Requests
      if (results.isNotEmpty && results[0] is List) {
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

      // 2. Donation Pledges
      if (results.length > 1 && results[1] is List) {
        final rawPledges = results[1] as List;
        _pledges = rawPledges
            .map((json) => DonationPledgeModel.fromJson(Map<String, dynamic>.from(json)))
            .toList();
      }

      // 3. Donation History & Impact Stats
      if (results.length > 2 && results[2] != null) {
        final histResult = results[2];
        if (histResult is Map) {
          if (histResult['total_donations'] != null) {
            _totalDonations = (histResult['total_donations'] as num?)?.toInt() ?? 0;
          }
          if (histResult['total_units'] != null) {
            _totalUnits = (histResult['total_units'] as num?)?.toInt() ?? 0;
          }
          if (histResult['lives_saved'] != null) {
            _livesSaved = (histResult['lives_saved'] as num?)?.toInt() ?? 0;
          }
          if (histResult['hero_tier'] != null) {
            _heroTier = histResult['hero_tier'].toString();
          }
          if (histResult['days_since_last_donation'] != null) {
            _daysSinceLastDonation = (histResult['days_since_last_donation'] as num?)?.toInt();
          }
          if (histResult['last_donation_date'] != null) {
            _lastDonationDate = histResult['last_donation_date']?.toString();
          }

          final rawHist = histResult['history'] ?? histResult['donations'];
          if (rawHist is List) {
            _history = rawHist
                .map((json) => DonationHistoryModel.fromJson(Map<String, dynamic>.from(json)))
                .toList();
          }
        } else if (histResult is List) {
          _history = histResult
              .map((json) => DonationHistoryModel.fromJson(Map<String, dynamic>.from(json)))
              .toList();
          _totalDonations = _history.length;
          _totalUnits = _history.fold(0, (sum, h) => sum + h.units);
          _livesSaved = _totalUnits * 3;
          if (_totalDonations >= 10) {
            _heroTier = 'Platinum Hero';
          } else if (_totalDonations >= 5) {
            _heroTier = 'Gold Guardian';
          } else if (_totalDonations >= 3) {
            _heroTier = 'Silver Savior';
          } else if (_totalDonations >= 1) {
            _heroTier = 'Bronze Champion';
          }
        }
      }
    } catch (e) {
      debugPrint('DonorProvider.loadDonorData error: $e');
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
