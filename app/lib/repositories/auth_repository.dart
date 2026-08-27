import '../core/api_client.dart';
import '../core/token_storage.dart';

class AuthTokens {
  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
  });

  final String accessToken;
  final String refreshToken;
  final String tokenType;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      tokenType: json['token_type'] as String? ?? 'bearer',
    );
  }
}

abstract class AuthRepository {
  Future<void> register({
    required String email,
    required String password,
    required String fullName,
  });
  Future<AuthTokens> login({required String email, required String password});
  Future<void> logout();
}

class ApiAuthRepository implements AuthRepository {
  const ApiAuthRepository({
    required this.apiClient,
    required this.tokenStorage,
  });

  final ApiClient apiClient;
  final TokenStorage tokenStorage;

  @override
  Future<void> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    await apiClient.postJson(
      '/api/auth/register',
      body: {'email': email, 'password': password, 'full_name': fullName},
    );
  }

  @override
  Future<AuthTokens> login({
    required String email,
    required String password,
  }) async {
    final json = await apiClient.postJson(
      '/api/auth/login',
      body: {'email': email, 'password': password},
    );
    final tokens = AuthTokens.fromJson(json);
    await tokenStorage.saveTokens(
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    );
    return tokens;
  }

  @override
  Future<void> logout() async {
    await tokenStorage.clear();
  }
}
