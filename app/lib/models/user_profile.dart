class UserProfile {
  const UserProfile({
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
  final String? fullName;
  final double accumulatedEggshellKg;
  final double savedCo2Kg;
  final int rewardPoints;
  final int contributionCount;
  final int pendingContributionCount;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    double number(Object? value) => value is num
        ? value.toDouble()
        : double.tryParse(value?.toString() ?? '') ?? 0;
    return UserProfile(
      id: (json['id'] as num?)?.toInt() ?? 0,
      email: json['email'] as String? ?? '',
      fullName: json['full_name'] as String?,
      accumulatedEggshellKg: number(json['accumulated_eggshell_kg']),
      savedCo2Kg: number(json['saved_co2_kg']),
      rewardPoints: (json['reward_points'] as num?)?.toInt() ?? 0,
      contributionCount: (json['contribution_count'] as num?)?.toInt() ?? 0,
      pendingContributionCount:
          (json['pending_contribution_count'] as num?)?.toInt() ?? 0,
    );
  }
}
