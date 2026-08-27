import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'api_exception.dart';
import 'token_storage.dart';

class ApiClient {
  ApiClient({
    required this.baseUrl,
    required this.tokenStorage,
    HttpClient? httpClient,
  }) : _httpClient = httpClient ?? HttpClient();

  final Uri baseUrl;
  final TokenStorage tokenStorage;
  final HttpClient _httpClient;
  Future<bool>? _refreshingToken;
  void Function()? onAuthenticationExpired;

  static const _requestTimeout = Duration(seconds: 12);

  Future<Map<String, dynamic>> getJson(String path) async {
    final response = await _send('GET', path);
    return _decodeObject(response);
  }

  Future<List<dynamic>> getList(String path) async {
    final response = await _send('GET', path);
    final decoded = jsonDecode(response);
    if (decoded is List) {
      return decoded;
    }
    throw const ApiException(
      statusCode: 500,
      message: 'Expected list response',
    );
  }

  Future<Map<String, dynamic>> postJson(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await _send('POST', path, body: body);
    return _decodeObject(response);
  }

  Future<Map<String, dynamic>> patchJson(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await _send('PATCH', path, body: body);
    return _decodeObject(response);
  }

  Future<String> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool allowRefresh = true,
  }) async {
    try {
      final request = await _httpClient
          .openUrl(method, baseUrl.resolve(path))
          .timeout(_requestTimeout);
      request.headers.contentType = ContentType.json;

      final token = await tokenStorage.readAccessToken();
      if (token != null && token.isNotEmpty) {
        request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
      }

      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close().timeout(_requestTimeout);
      final text = await response
          .transform(utf8.decoder)
          .join()
          .timeout(_requestTimeout);
      if (response.statusCode == HttpStatus.unauthorized &&
          !_isAuthEntryPoint(path)) {
        if (allowRefresh && await _refreshAccessToken()) {
          return await _send(method, path, body: body, allowRefresh: false);
        }
        await tokenStorage.clear();
        onAuthenticationExpired?.call();
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiException(
          statusCode: response.statusCode,
          message: _messageForStatus(response.statusCode),
          body: text.isEmpty ? null : text,
        );
      }
      return text.isEmpty ? '{}' : text;
    } on TimeoutException {
      throw const ApiException(statusCode: 408, message: '서버 응답 시간이 초과되었습니다.');
    }
  }

  bool _isAuthEntryPoint(String path) =>
      path == '/api/auth/login' ||
      path == '/api/auth/register' ||
      path == '/api/auth/refresh';

  Future<bool> _refreshAccessToken() {
    final inFlight = _refreshingToken;
    if (inFlight != null) return inFlight;

    final refresh = _performTokenRefresh();
    _refreshingToken = refresh;
    return refresh.whenComplete(() => _refreshingToken = null);
  }

  Future<bool> _performTokenRefresh() async {
    final refreshToken = await tokenStorage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return false;

    try {
      final request = await _httpClient
          .postUrl(baseUrl.resolve('/api/auth/refresh'))
          .timeout(_requestTimeout);
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({'refresh_token': refreshToken}));
      final response = await request.close().timeout(_requestTimeout);
      final text = await response
          .transform(utf8.decoder)
          .join()
          .timeout(_requestTimeout);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        await tokenStorage.clear();
        return false;
      }
      final decoded = jsonDecode(text);
      if (decoded is! Map<String, dynamic>) {
        await tokenStorage.clear();
        return false;
      }
      final accessToken = decoded['access_token'];
      final nextRefreshToken = decoded['refresh_token'];
      if (accessToken is! String || nextRefreshToken is! String) {
        await tokenStorage.clear();
        return false;
      }
      await tokenStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: nextRefreshToken,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Map<String, dynamic> _decodeObject(String response) {
    final decoded = jsonDecode(response);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }
    throw const ApiException(
      statusCode: 500,
      message: 'Expected object response',
    );
  }

  String _messageForStatus(int statusCode) {
    return switch (statusCode) {
      401 => '인증이 만료되었습니다. 다시 로그인해주세요.',
      403 => '접근 권한이 없습니다.',
      404 => '요청한 데이터를 찾을 수 없습니다.',
      409 => '이미 처리된 요청이거나 상태가 충돌했습니다.',
      422 => '입력값을 확인해주세요.',
      _ => '서버 요청에 실패했습니다.',
    };
  }
}
