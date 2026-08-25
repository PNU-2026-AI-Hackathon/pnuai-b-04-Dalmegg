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
  }) async {
    final request = await _httpClient.openUrl(method, baseUrl.resolve(path));
    request.headers.contentType = ContentType.json;

    final token = await tokenStorage.readAccessToken();
    if (token != null && token.isNotEmpty) {
      request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    }

    if (body != null) {
      request.write(jsonEncode(body));
    }

    final response = await request.close();
    final text = await response.transform(utf8.decoder).join();
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        statusCode: response.statusCode,
        message: _messageForStatus(response.statusCode),
        body: text.isEmpty ? null : text,
      );
    }
    return text.isEmpty ? '{}' : text;
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
