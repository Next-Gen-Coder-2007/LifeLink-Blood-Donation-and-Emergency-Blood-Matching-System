import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class NetworkClient {
  static const Duration timeoutDuration = Duration(seconds: 12);

  static Future<Map<String, String>> _getHeaders({Map<String, String>? extraHeaders}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token') ?? '';

    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  static Future<dynamic> get(String url, {Map<String, String>? headers}) async {
    try {
      final reqHeaders = await _getHeaders(extraHeaders: headers);
      final response = await http
          .get(Uri.parse(url), headers: reqHeaders)
          .timeout(timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw Exception('Unable to reach server. Please verify your connection.');
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> post(String url, {dynamic body, Map<String, String>? headers}) async {
    try {
      final reqHeaders = await _getHeaders(extraHeaders: headers);
      final response = await http
          .post(
            Uri.parse(url),
            headers: reqHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw Exception('Unable to reach server. Please verify your connection.');
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> put(String url, {dynamic body, Map<String, String>? headers}) async {
    try {
      final reqHeaders = await _getHeaders(extraHeaders: headers);
      final response = await http
          .put(
            Uri.parse(url),
            headers: reqHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw Exception('Unable to reach server. Please verify your connection.');
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> delete(String url, {Map<String, String>? headers}) async {
    try {
      final reqHeaders = await _getHeaders(extraHeaders: headers);
      final response = await http
          .delete(Uri.parse(url), headers: reqHeaders)
          .timeout(timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw Exception('Unable to reach server. Please verify your connection.');
    } catch (e) {
      rethrow;
    }
  }

  static dynamic _processResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    if (body is Map && (body['message'] != null || body['detail'] != null)) {
      throw Exception(body['message'] ?? body['detail']);
    }

    throw Exception('Server returned status code: ${response.statusCode}');
  }
}
