import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  // Remote production cloud URL or local dev URL
  static const String productionBaseUrl = 'https://life-link-blood-donation-and-emerge-rust.vercel.app';
  static const String localAndroidUrl = 'http://10.0.2.2:8000';
  static const String localIosWebUrl = 'http://localhost:8000';

  static String baseUrl = _determineBaseUrl();

  static String _determineBaseUrl() {
    if (kIsWeb) {
      return productionBaseUrl;
    }
    return productionBaseUrl;
  }

  static Future<void> loadSavedBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final custom = prefs.getString('custom_api_base_url');
      if (custom != null && custom.trim().isNotEmpty) {
        baseUrl = custom.trim().replaceAll(RegExp(r'/+$'), '');
      }
    } catch (_) {}
  }

  static Future<void> setCustomBaseUrl(String url) async {
    final cleanUrl = url.trim().replaceAll(RegExp(r'/+$'), '');
    baseUrl = cleanUrl;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('custom_api_base_url', cleanUrl);
    } catch (_) {}
  }

  static Future<void> resetToDefault() async {
    baseUrl = productionBaseUrl;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('custom_api_base_url');
    } catch (_) {}
  }

  // Auth & User Endpoints
  static String get login => '$baseUrl/login';
  static String get users => '$baseUrl/users';
  static String userById(String userId) => '$baseUrl/users/$userId';
  static String userDonorProfile(String userId) => '$baseUrl/users/$userId/donor';
  static String userHospitalProfile(String userId) => '$baseUrl/users/$userId/hospital';

  // Donor Endpoints
  static String get donors => '$baseUrl/donors';
  static String donorByUserId(String userId) => '$baseUrl/donors/user/$userId';
  static String donorById(String id) => '$baseUrl/donors/$id';
  static String directRequest(String donorId) => '$baseUrl/donors/$donorId/direct-request';

  // Hospital Endpoints
  static String get hospitals => '$baseUrl/hospitals';
  static String hospitalByUserId(String userId) => '$baseUrl/hospitals/user/$userId';
  static String hospitalById(String id) => '$baseUrl/hospitals/$id';
  static String get hospitalsPublicMap => '$baseUrl/hospitals/public-map';

  // Blood Request Endpoints
  static String get bloodRequests => '$baseUrl/blood-requests';
  static String bloodRequestById(String id) => '$baseUrl/blood-requests/$id';
  static String bloodRequestsByHospital(String hospitalId) => '$baseUrl/blood-requests/hospital/$hospitalId';
  static String bloodRequestsByDonor(String donorId) => '$baseUrl/blood-requests/donor/$donorId';

  // Donation Pledge Endpoints
  static String get donationPledges => '$baseUrl/donation-pledges';
  static String donationPledgeById(String id) => '$baseUrl/donation-pledges/$id';
  static String donationPledgesByDonor(String donorId) => '$baseUrl/donation-pledges/donor/$donorId';
  static String donationPledgesByHospital(String hospitalId) => '$baseUrl/donation-pledges/hospital/$hospitalId';
  static String completePledge(String pledgeId) => '$baseUrl/donation-pledges/$pledgeId/complete';

  // Donation History Endpoints
  static String get donationHistory => '$baseUrl/donation-history';
  static String donationHistoryByDonor(String donorId) => '$baseUrl/donation-history/donor/$donorId';
  static String donationHistoryByHospital(String hospitalId) => '$baseUrl/donation-history/hospital/$hospitalId';

  // Blood Inventory Endpoints
  static String bloodInventoryByHospital(String hospitalId) => '$baseUrl/hospitals/$hospitalId/blood-bank';
  static String bloodBankByHospital(String hospitalId) => '$baseUrl/hospitals/$hospitalId/blood-bank';

  // Notifications Endpoints
  static String notificationsByUser(String userId, {String? role}) =>
      '$baseUrl/notifications/user/$userId${role != null ? '?role=$role' : ''}';
  static String markNotificationRead(String id) => '$baseUrl/notifications/$id/read';
  static String markAllNotificationsRead(String userId) => '$baseUrl/notifications/user/$userId/read-all';
  static String deleteNotification(String id) => '$baseUrl/notifications/$id';

  // Analytics Endpoints
  static String get analyticsStats => '$baseUrl/analytics/stats';

  // Matching Endpoints
  static String get matchingMatrix => '$baseUrl/matching/matrix';
  static String matchingDonors(String recipientGroup) =>
      '$baseUrl/matching/donors?recipient_group=${Uri.encodeComponent(recipientGroup)}';
}
