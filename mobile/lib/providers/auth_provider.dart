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
  double _userLat = 40.7128;
  double _userLng = -74.006;

  UserModel? get user => _user;
  DonorModel? get donorProfile => _donorProfile;
  HospitalModel? get hospitalProfile => _hospitalProfile;
  String? get token => _token;
  bool get isLoading => _isLoading;
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
      final prefs = await SharedPreferences.getInstance();
      final userRaw = prefs.getString('auth_user');
      _token = prefs.getString('auth_token');

      if (userRaw != null && userRaw.isNotEmpty) {
        final Map<String, dynamic> userMap = jsonDecode(userRaw);
        _user = UserModel.fromJson(userMap);
        await _fetchRoleProfile();
      }

      await syncLocation();
    } catch (_) {
      // Ignored session restore error
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> syncLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
      ).timeout(const Duration(seconds: 4));

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
        final res = await NetworkClient.get(ApiConfig.donorByUserId(_user!.id));
        if (res is Map) {
          _donorProfile = DonorModel.fromJson(Map<String, dynamic>.from(res));
          if (_donorProfile!.latitude != 0) {
            _userLat = _donorProfile!.latitude;
            _userLng = _donorProfile!.longitude;
          }
        }
      } else if (_user!.role == 'hospital') {
        final res = await NetworkClient.get(ApiConfig.hospitalByUserId(_user!.id));
        if (res is Map) {
          _hospitalProfile = HospitalModel.fromJson(Map<String, dynamic>.from(res));
          if (_hospitalProfile!.latitude != 0) {
            _userLat = _hospitalProfile!.latitude;
            _userLng = _hospitalProfile!.longitude;
          }
        }
      }
    } catch (_) {}
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
    notifyListeners();
  }
}
