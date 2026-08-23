class CollectionRecord {
  const CollectionRecord({
    this.id = 0,
    required this.date,
    required this.location,
    required this.grams,
    this.status = 'approved',
  });

  final int id;
  final String date;
  final String location;
  final int grams;
  final String status;

  factory CollectionRecord.fromJson(Map<String, dynamic> json) {
    final createdAt = DateTime.tryParse(json['created_at'] as String? ?? '')?.toLocal();
    final memo = json['memo'] as String? ?? '';
    final locationMatch = RegExp(r'^\[([^\]]+)\]').firstMatch(memo);
    final weightValue = json['weight_kg'];
    final weightKg = weightValue is num
        ? weightValue.toDouble()
        : double.tryParse(weightValue?.toString() ?? '') ?? 0;
    return CollectionRecord(
      id: (json['id'] as num?)?.toInt() ?? 0,
      date: createdAt == null
          ? '-'
          : '${createdAt.month.toString().padLeft(2, '0')}.'
              '${createdAt.day.toString().padLeft(2, '0')}',
      location: locationMatch?.group(1) ?? '수거 참여',
      grams: (weightKg * 1000).round(),
      status: json['status'] as String? ?? 'pending',
    );
  }
}
