import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import '../config/api_config.dart';
import '../core/network_client.dart';
import '../models/user_model.dart';
import '../models/donor_model.dart';
import '../models/hospital_model.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  DonorModel? _donorProfile;
  HospitalModel? _hospitalProfile;
  String? _token;
  bool _isLoading = true;
  bool _isInitialized = false;
  double _userLat = 40.7128;
  double _userLng = -74.006;

  UserModel? get user => _user;
  DonorModel? get donorProfile => _donorProfile;
  HospitalModel? get hospitalProfile => _hospitalProfile;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  bool get isAuthenticated => _user != null;
  bool get isDonor => _user?.role == 'donor';
  bool get isHospital => _user?.role == 'hospital';
  bool get isAdmin => _user?.role == 'admin';
  double get userLat => _userLat;
  double get userLng => _userLng;

  AuthProvider() {
    initAuth();
  }

  Future<void> initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiConfig.loadSavedBaseUrl();
      final prefs = await SharedPreferences.getInstance();
      final userRaw = prefs.getString('auth_user');
      _token = prefs.getString('auth_token');

      // 1. Immediately restore cached user & profiles from local storage
      if (userRaw != null && userRaw.isNotEmpty) {
        final Map<String, dynamic> userMap = jsonDecode(userRaw);
        _user = UserModel.fromJson(userMap);

        final donorRaw = prefs.getString('auth_donor_profile');
        if (donorRaw != null && donorRaw.isNotEmpty) {
          try {
            _donorProfile = DonorModel.fromJson(jsonDecode(donorRaw));
            if (_donorProfile!.latitude != 0) {
              _userLat = _donorProfile!.latitude;
              _userLng = _donorProfile!.longitude;
            }
          } catch (_) {}
        }

        final hospRaw = prefs.getString('auth_hospital_profile');
        if (hospRaw != null && hospRaw.isNotEmpty) {
          try {
            _hospitalProfile = HospitalModel.fromJson(jsonDecode(hospRaw));
            if (_hospitalProfile!.latitude != 0) {
              _userLat = _hospitalProfile!.latitude;
              _userLng = _hospitalProfile!.longitude;
            }
          } catch (_) {}
        }
      }

      _isInitialized = true;
      _isLoading = false;
      notifyListeners();

      // 2. Refresh freshness and GPS location asynchronously in the background
      if (_user != null) {
        _fetchRoleProfile().catchError((_) {});
      }
      syncLocation().catchError((_) {});
    } catch (_) {
      _isInitialized = true;
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> syncLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
        ).timeout(const Duration(seconds: 5));

        _userLat = pos.latitude;
        _userLng = pos.longitude;

        if (_donorProfile != null) {
          NetworkClient.put(ApiConfig.donorById(_donorProfile!.id), body: {
            'latitude': _userLat,
            'longitude': _userLng,
          }).catchError((_) => null);
        } else if (_hospitalProfile != null && (_hospitalProfile!.latitude == 0)) {
          NetworkClient.put(ApiConfig.hospitalById(_hospitalProfile!.id), body: {
            'latitude': _userLat,
            'longitude': _userLng,
          }).catchError((_) => null);
        }
      }
    } catch (_) {
      // Use fallback defaults
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await NetworkClient.post(ApiConfig.login, body: {
        'email': email.trim(),
        'password': password,
      });

      if (res is Map) {
        final userData = res['user'] ?? res;
        _token = res['token']?.toString() ?? 'active-session';
        _user = UserModel.fromJson(Map<String, dynamic>.from(userData));

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('auth_user', jsonEncode(_user!.toJson()));

        await _fetchRoleProfile();
        await syncLocation();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> registerDonor({
    required String name,
    required String email,
    required String password,
    required String bloodGroup,
    required String phone,
    required String address,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Create base user
      final userRes = await NetworkClient.post(ApiConfig.users, body: {
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'role': 'donor',
      });

      if (userRes is Map && userRes['user_id'] != null) {
        final userId = userRes['user_id'].toString();

        // 2. Create donor profile
        await NetworkClient.post(ApiConfig.userDonorProfile(userId), body: {
          'blood_group': bloodGroup,
          'phone': phone.trim(),
          'address': address.trim(),
          'latitude': _userLat,
          'longitude': _userLng,
          'availability': true,
        });

        // 3. Authenticate session
        await login(email, password);
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> registerHospital({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String emergencyContact,
    required String address,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Create base user
      final userRes = await NetworkClient.post(ApiConfig.users, body: {
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'role': 'hospital',
      });

      if (userRes is Map && userRes['user_id'] != null) {
        final userId = userRes['user_id'].toString();

        // 2. Create hospital profile
        await NetworkClient.post(ApiConfig.userHospitalProfile(userId), body: {
          'hospital_name': name.trim(),
          'phone': phone.trim(),
          'emergency_contact': emergencyContact.trim(),
          'address': address.trim(),
          'latitude': _userLat,
          'longitude': _userLng,
        });

        // 3. Authenticate session
        await login(email, password);
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _fetchRoleProfile() async {
    if (_user == null) return;
    try {
      if (_user!.role == 'donor') {
        dynamic res;
        try {
          res = await NetworkClient.get(ApiConfig.donorByUserId(_user!.id));
        } catch (_) {
          if (_user!.profileId != null && _user!.profileId!.isNotEmpty) {
            try {
              res = await NetworkClient.get(ApiConfig.donorById(_user!.profileId!));
            } catch (_) {}
          }
          if (res == null) {
            try {
              final donors = await NetworkClient.get(ApiConfig.donors);
              if (donors is List) {
                res = donors.firstWhere(
                  (d) => d['user_id']?.toString() == _user!.id || d['id']?.toString() == _user!.profileId,
                  orElse: () => null,
                );
              }
            } catch (_) {}
          }
        }

        if (res is Map) {
          _donorProfile = DonorModel.fromJson(Map<String, dynamic>.from(res));
          if (_donorProfile!.latitude != 0) {
            _userLat = _donorProfile!.latitude;
            _userLng = _donorProfile!.longitude;
          }
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_donor_profile', jsonEncode(_donorProfile!.toJson()));
          notifyListeners();
        }
      } else if (_user!.role == 'hospital') {
        dynamic res;
        // 1. Try get hospital by user id
        try {
          res = await NetworkClient.get(ApiConfig.hospitalByUserId(_user!.id));
        } catch (_) {
          // 2. Try get hospital by profileId if available
          if (_user!.profileId != null && _user!.profileId!.isNotEmpty) {
            try {
              res = await NetworkClient.get(ApiConfig.hospitalById(_user!.profileId!));
            } catch (_) {}
          }
          // 3. Try fetching all hospitals and match by user_id or id
          if (res == null) {
            try {
              final hospitals = await NetworkClient.get(ApiConfig.hospitals);
              if (hospitals is List) {
                res = hospitals.firstWhere(
                  (h) => h['user_id']?.toString() == _user!.id || h['id']?.toString() == _user!.profileId,
                  orElse: () => null,
                );
              }
            } catch (_) {}
          }
        }

        if (res is Map) {
          _hospitalProfile = HospitalModel.fromJson(Map<String, dynamic>.from(res));
          if (_hospitalProfile!.latitude != 0) {
            _userLat = _hospitalProfile!.latitude;
            _userLng = _hospitalProfile!.longitude;
          }
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_hospital_profile', jsonEncode(_hospitalProfile!.toJson()));
          notifyListeners();
        } else if (_user!.profileId != null && _user!.profileId!.isNotEmpty) {
          // Fallback minimal hospital profile so features never fail with null
          _hospitalProfile = HospitalModel(
            id: _user!.profileId!,
            userId: _user!.id,
            hospitalName: _user!.name,
            phone: '',
            emergencyContact: '',
            address: 'Medical Facility',
            latitude: _userLat,
            longitude: _userLng,
          );
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_hospital_profile', jsonEncode(_hospitalProfile!.toJson()));
          notifyListeners();
        }
      }
    } catch (_) {}
  }

  Future<void> updateUserProfile({
    required String name,
    required String email,
    String? password,
  }) async {
    if (_user == null) return;
    try {
      final body = <String, dynamic>{
        'name': name.trim(),
        'email': email.trim(),
      };
      if (password != null && password.trim().isNotEmpty) {
        body['password'] = password.trim();
      }

      await NetworkClient.put(ApiConfig.userById(_user!.id), body: body);

      _user = UserModel(
        id: _user!.id,
        name: name.trim(),
        email: email.trim(),
        role: _user!.role,
        profileId: _user!.profileId,
        bloodGroup: _user!.bloodGroup,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_user', jsonEncode(_user!.toJson()));

      if (_donorProfile != null) {
        _donorProfile = DonorModel(
          id: _donorProfile!.id,
          userId: _donorProfile!.userId,
          donorName: name.trim(),
          bloodGroup: _donorProfile!.bloodGroup,
          phone: _donorProfile!.phone,
          address: _donorProfile!.address,
          latitude: _donorProfile!.latitude,
          longitude: _donorProfile!.longitude,
          availability: _donorProfile!.availability,
          lastDonationDate: _donorProfile!.lastDonationDate,
        );
        await prefs.setString('auth_donor_profile', jsonEncode(_donorProfile!.toJson()));
      }

      if (_hospitalProfile != null) {
        _hospitalProfile = HospitalModel(
          id: _hospitalProfile!.id,
          userId: _hospitalProfile!.userId,
          hospitalName: name.trim(),
          phone: _hospitalProfile!.phone,
          emergencyContact: _hospitalProfile!.emergencyContact,
          address: _hospitalProfile!.address,
          latitude: _hospitalProfile!.latitude,
          longitude: _hospitalProfile!.longitude,
        );
        await prefs.setString('auth_hospital_profile', jsonEncode(_hospitalProfile!.toJson()));
      }

      notifyListeners();
    } catch (_) {
      rethrow;
    }
  }

  Future<void> updateDonorProfile({
    required String phone,
    required String bloodGroup,
    required String address,
    required bool availability,
    String? lastDonationDate,
  }) async {
    final donorId = _donorProfile?.id ?? _user?.profileId;
    if (donorId == null || donorId.isEmpty) return;

    try {
      final body = <String, dynamic>{
        'phone': phone.trim(),
        'blood_group': bloodGroup.toUpperCase(),
        'address': address.trim(),
        'availability': availability,
        'last_donation_date': (lastDonationDate != null && lastDonationDate.trim().isNotEmpty) ? lastDonationDate.trim() : null,
      };

      await NetworkClient.put(ApiConfig.donorById(donorId), body: body);

      _donorProfile = DonorModel(
        id: donorId,
        userId: _donorProfile?.userId ?? _user?.id ?? '',
        donorName: _donorProfile?.donorName ?? _user?.name ?? 'Volunteer Donor',
        bloodGroup: bloodGroup.toUpperCase(),
        phone: phone.trim(),
        address: address.trim(),
        latitude: _donorProfile?.latitude ?? _userLat,
        longitude: _donorProfile?.longitude ?? _userLng,
        availability: availability,
        lastDonationDate: (lastDonationDate != null && lastDonationDate.trim().isNotEmpty) ? lastDonationDate.trim() : null,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_donor_profile', jsonEncode(_donorProfile!.toJson()));

      if (_user != null) {
        _user = UserModel(
          id: _user!.id,
          name: _user!.name,
          email: _user!.email,
          role: _user!.role,
          profileId: _user!.profileId,
          bloodGroup: bloodGroup.toUpperCase(),
        );
        await prefs.setString('auth_user', jsonEncode(_user!.toJson()));
      }

      notifyListeners();
    } catch (_) {
      rethrow;
    }
  }

  Future<void> updateHospitalProfile({
    required String hospitalName,
    required String phone,
    required String emergencyContact,
    required String address,
  }) async {
    final hospId = _hospitalProfile?.id ?? _user?.profileId;
    if (hospId == null || hospId.isEmpty) return;

    try {
      final body = <String, dynamic>{
        'hospital_name': hospitalName.trim(),
        'phone': phone.trim(),
        'emergency_contact': emergencyContact.trim(),
        'address': address.trim(),
      };

      await NetworkClient.put(ApiConfig.hospitalById(hospId), body: body);

      _hospitalProfile = HospitalModel(
        id: hospId,
        userId: _hospitalProfile?.userId ?? _user?.id ?? '',
        hospitalName: hospitalName.trim(),
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
        address: address.trim(),
        latitude: _hospitalProfile?.latitude ?? _userLat,
        longitude: _hospitalProfile?.longitude ?? _userLng,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_hospital_profile', jsonEncode(_hospitalProfile!.toJson()));

      notifyListeners();
    } catch (_) {
      rethrow;
    }
  }

  Future<void> updateDonorAvailability(bool available) async {
    if (_donorProfile == null) return;
    try {
      await NetworkClient.put(ApiConfig.donorById(_donorProfile!.id), body: {
        'availability': available,
      });
      _donorProfile = DonorModel(
        id: _donorProfile!.id,
        userId: _donorProfile!.userId,
        donorName: _donorProfile!.donorName,
        bloodGroup: _donorProfile!.bloodGroup,
        phone: _donorProfile!.phone,
        address: _donorProfile!.address,
        latitude: _donorProfile!.latitude,
        longitude: _donorProfile!.longitude,
        availability: available,
        lastDonationDate: _donorProfile!.lastDonationDate,
      );
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_donor_profile', jsonEncode(_donorProfile!.toJson()));
      notifyListeners();
    } catch (_) {
      rethrow;
    }
  }

  Future<void> logout() async {
    _user = null;
    _donorProfile = null;
    _hospitalProfile = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_user');
    await prefs.remove('auth_donor_profile');
    await prefs.remove('auth_hospital_profile');
    notifyListeners();
  }
}
