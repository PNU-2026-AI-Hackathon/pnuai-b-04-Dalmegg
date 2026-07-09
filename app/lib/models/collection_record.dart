class CollectionRecord {
  const CollectionRecord({
    required this.date,
    required this.location,
    required this.grams,
    this.status = CollectionStatus.approved,
    this.memo,
    this.imageUrl,
  });

  final String date;
  final String location;
  final int grams;
  final CollectionStatus status;
  final String? memo;
  final String? imageUrl;

  factory CollectionRecord.fromContributionJson(Map<String, dynamic> json) {
    return CollectionRecord(
      date: _shortDate(json['created_at'] as String?),
      location: json['location_name'] as String? ?? '계란껍질 수거 신청',
      grams: (((json['weight_kg'] as num?) ?? 0) * 1000).round(),
      status: CollectionStatusX.fromApiValue(json['status'] as String?),
      memo: json['memo'] as String?,
      imageUrl: json['image_url'] as String?,
    );
  }

  static String _shortDate(String? isoDate) {
    if (isoDate == null || isoDate.isEmpty) {
      return '오늘';
    }
    final parsed = DateTime.tryParse(isoDate);
    if (parsed == null) {
      return isoDate;
    }
    return '${parsed.month.toString().padLeft(2, '0')}.${parsed.day.toString().padLeft(2, '0')}';
  }
}

enum CollectionStatus { pending, approved, rejected }

extension CollectionStatusX on CollectionStatus {
  static CollectionStatus fromApiValue(String? value) {
    return switch (value) {
      'pending' => CollectionStatus.pending,
      'rejected' => CollectionStatus.rejected,
      _ => CollectionStatus.approved,
    };
  }

  String get label {
    return switch (this) {
      CollectionStatus.pending => '승인 대기',
      CollectionStatus.approved => '승인 완료',
      CollectionStatus.rejected => '반려',
    };
  }
}
