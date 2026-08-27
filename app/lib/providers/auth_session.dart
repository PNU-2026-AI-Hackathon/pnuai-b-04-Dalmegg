import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';

import '../core/api_exception.dart';
import '../repositories/auth_repository.dart';

class AuthSession extends ChangeNotifier {
  AuthSession({
    required AuthRepository authRepository,
    bool isAuthenticated = false,
  }) : this._(authRepository, isAuthenticated);

  AuthSession._(this._authRepository, this._isAuthenticated);

  final AuthRepository _authRepository;

  bool _isAuthenticated;
  bool _isLoading = false;
  String? _errorMessage;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.register(
        email: email,
        password: password,
        fullName: fullName,
      );
      await _authRepository.login(email: email, password: password);
      _isAuthenticated = true;
      return true;
    } catch (error) {
      _errorMessage = _messageFromError(
        error,
        fallback: '회원가입에 실패했습니다. 입력값을 확인해주세요.',
      );
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.login(email: email, password: password);
      _isAuthenticated = true;
      return true;
    } catch (error) {
      _errorMessage = _messageFromError(
        error,
        fallback: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
      );
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _isAuthenticated = false;
    notifyListeners();
  }

  String _messageFromError(Object error, {required String fallback}) {
    if (error is SocketException) {
      return '서버에 연결할 수 없습니다. API 주소와 서버 실행 상태를 확인해주세요.';
    }

    if (error is ApiException) {
      final bodyMessage = _messageFromBody(error.body);
      if (bodyMessage != null && bodyMessage.isNotEmpty) {
        return bodyMessage;
      }
      if (error.statusCode == 409) {
        return '이미 가입된 이메일입니다.';
      }
      return error.message;
    }

    return fallback;
  }

  String? _messageFromBody(Object? body) {
    if (body is! String || body.isEmpty) {
      return null;
    }

    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        final detail = decoded['detail'];
        if (detail is String) {
          return detail;
        }
        if (detail is List && detail.isNotEmpty) {
          final first = detail.first;
          if (first is Map<String, dynamic> && first['msg'] is String) {
            return first['msg'] as String;
          }
        }
        final message = decoded['message'];
        if (message is String) {
          return message;
        }
      }
    } catch (_) {
      return body;
    }

    return null;
  }
}
