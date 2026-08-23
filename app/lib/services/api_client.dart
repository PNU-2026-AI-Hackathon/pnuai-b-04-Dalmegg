import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/collection_record.dart';
import '../models/flower.dart';
import '../models/program.dart';
import '../models/user_profile.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = (baseUrl ?? AppConfig.apiBaseUrl).replaceFirst(RegExp(r'/$'), '');

  final http.Client _client;
  final String baseUrl;
  String? _accessToken;
  String? _refreshToken;

  bool get isAuthenticated => _accessToken != null;

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    await _request(
      'POST',
      '/auth/register',
      body: {'email': email, 'password': password, 'full_name': fullName},
    );
    await login(email: email, password: password);
  }

  Future<void> login({required String email, required String password}) async {
    final data = await _request(
      'POST',
      '/auth/login',
      body: {'email': email, 'password': password},
    ) as Map<String, dynamic>;
    _accessToken = data['access_token'] as String?;
    _refreshToken = data['refresh_token'] as String?;
    if (_accessToken == null) {
      throw const ApiException('로그인 토큰을 받지 못했습니다.');
    }
  }

  Future<void> logout() async {
    try {
      if (isAuthenticated) {
        await _request(
          'POST',
          '/auth/logout',
          authenticated: true,
          body: {'refresh_token': _refreshToken},
        );
      }
    } finally {
      _accessToken = null;
      _refreshToken = null;
    }
  }

  Future<List<Flower>> listFlowers() async {
    final data = await _request('GET', '/flowers') as List<dynamic>;
    return data
        .cast<Map<String, dynamic>>()
        .map(Flower.fromJson)
        .toList(growable: false);
  }

  Future<List<Program>> listPrograms() async {
    final data = await _request('GET', '/programs') as List<dynamic>;
    return data
        .cast<Map<String, dynamic>>()
        .map(Program.fromJson)
        .toList(growable: false);
  }

  Future<UserProfile> getMyProfile() async {
    final data = await _request('GET', '/users/me', authenticated: true)
        as Map<String, dynamic>;
    return UserProfile.fromJson(data);
  }

  Future<List<CollectionRecord>> listContributions() async {
    final data = await _request(
      'GET',
      '/eco/contributions',
      authenticated: true,
    ) as List<dynamic>;
    return data
        .cast<Map<String, dynamic>>()
        .map(CollectionRecord.fromJson)
        .toList(growable: false);
  }

  Future<CollectionRecord> submitCollection({
    required String location,
    required int grams,
    String? memo,
  }) async {
    final detail = memo?.trim() ?? '';
    final data = await _request(
      'POST',
      '/collections',
      authenticated: true,
      body: {
        'weight_kg': grams / 1000,
        'memo': '[$location]${detail.isEmpty ? '' : ' $detail'}',
      },
    ) as Map<String, dynamic>;
    return CollectionRecord.fromJson(data);
  }

  Future<List<int>> listReservationProgramIds() async {
    final data = await _request('GET', '/reservations', authenticated: true)
        as List<dynamic>;
    return data
        .cast<Map<String, dynamic>>()
        .where((item) => item['status'] != 'cancelled')
        .map((item) => (item['program_id'] as num).toInt())
        .toList(growable: false);
  }

  Future<void> reserveProgram(int programId) async {
    await _request(
      'POST',
      '/reservations',
      authenticated: true,
      body: {'program_id': programId, 'participant_count': 1},
    );
  }

  Future<void> orderFlower(int flowerId) async {
    await _request(
      'POST',
      '/orders',
      authenticated: true,
      body: {
        'items': [
          {'flower_id': flowerId, 'quantity': 1},
        ],
      },
    );
  }

  Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = false,
    bool retryAfterRefresh = true,
  }) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (body != null) headers['Content-Type'] = 'application/json';
    if (authenticated && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }

    try {
      final uri = Uri.parse('$baseUrl$path');
      final encodedBody = body == null ? null : jsonEncode(body);
      final request = switch (method) {
        'GET' => _client.get(uri, headers: headers),
        'POST' => _client.post(uri, headers: headers, body: encodedBody),
        'PATCH' => _client.patch(uri, headers: headers, body: encodedBody),
        _ => throw ApiException('지원하지 않는 요청 방식입니다: $method'),
      };
      final response = await request.timeout(const Duration(seconds: 8));

      if (response.statusCode == 401 &&
          authenticated &&
          retryAfterRefresh &&
          _refreshToken != null) {
        await _refresh();
        return _request(
          method,
          path,
          body: body,
          authenticated: authenticated,
          retryAfterRefresh: false,
        );
      }

      dynamic payload;
      if (response.body.isNotEmpty) payload = jsonDecode(response.body);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        final detail = payload is Map<String, dynamic> ? payload['detail'] : null;
        throw ApiException(
          detail is String ? detail : '서버 요청에 실패했습니다.',
          statusCode: response.statusCode,
        );
      }
      return payload;
    } on TimeoutException {
      throw const ApiException('서버 응답 시간이 초과되었습니다.');
    } on FormatException {
      throw const ApiException('서버 응답 형식이 올바르지 않습니다.');
    } on http.ClientException {
      throw const ApiException('서버에 연결할 수 없습니다.');
    }
  }

  Future<void> _refresh() async {
    final refreshToken = _refreshToken;
    if (refreshToken == null) throw const ApiException('다시 로그인해주세요.');
    final data = await _request(
      'POST',
      '/auth/refresh',
      body: {'refresh_token': refreshToken},
      retryAfterRefresh: false,
    ) as Map<String, dynamic>;
    _accessToken = data['access_token'] as String?;
    _refreshToken = data['refresh_token'] as String? ?? refreshToken;
  }
}
