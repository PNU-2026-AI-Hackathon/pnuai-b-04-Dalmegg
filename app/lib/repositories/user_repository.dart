import '../core/api_client.dart';

class UserSummary {
  const UserSummary({
    required this.id,
    required this.email,
    required this.fullName,
    required this.accumulatedEggshellKg,
    required this.savedCo2Kg,
    required this.rewardPoints,
    required this.contributionCount,
    required this.pendingContributionCount,
  });

  final int id;
  final String email;
  final String fullName;
  final double accumulatedEggshellKg;
  final double savedCo2Kg;
  final int rewardPoints;
  final int contributionCount;
  final int pendingContributionCount;

  int get accumulatedEggshellGrams => (accumulatedEggshellKg * 1000).round();

  factory UserSummary.fromJson(Map<String, dynamic> json) {
    return UserSummary(
      id: json['id'] as int,
      email: json['email'] as String,
      fullName: json['full_name'] as String? ?? '사용자',
      accumulatedEggshellKg: _asDouble(json['accumulated_eggshell_kg']),
      savedCo2Kg: _asDouble(json['saved_co2_kg']),
      rewardPoints: json['reward_points'] as int,
      contributionCount: json['contribution_count'] as int,
      pendingContributionCount: json['pending_contribution_count'] as int,
    );
  }

  static double _asDouble(Object? value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}

abstract class UserRepository {
  Future<UserSummary> fetchMe();
}

class MockUserRepository implements UserRepository {
  const MockUserRepository();

  @override
  Future<UserSummary> fetchMe() async {
    return const UserSummary(
      id: 1,
      email: 'user@test.com',
      fullName: '김순환',
      accumulatedEggshellKg: 0.32,
      savedCo2Kg: 0.118,
      rewardPoints: 32,
      contributionCount: 3,
      pendingContributionCount: 0,
    );
  }
}

class ApiUserRepository implements UserRepository {
  const ApiUserRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<UserSummary> fetchMe() async {
    final json = await apiClient.getJson('/api/users/me');
    return UserSummary.fromJson(json);
  }
}
