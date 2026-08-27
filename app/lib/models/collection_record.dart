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
    final rawMemo = json['memo'] as String?;
    return CollectionRecord(
      date: _shortDate(json['created_at'] as String?),
      location:
          json['location_name'] as String? ??
          _locationFromMemo(rawMemo) ??
          '계란껍질 수거 신청',
      grams: (_asDouble(json['weight_kg']) * 1000).round(),
      status: CollectionStatusX.fromApiValue(json['status'] as String?),
      memo: _memoWithoutLocation(rawMemo),
      imageUrl: json['image_url'] as String?,
    );
  }

  static String? _locationFromMemo(String? memo) {
    if (memo == null || !memo.startsWith('[수거 장소] ')) {
      return null;
    }
    return memo.split('\n').first.substring('[수거 장소] '.length).trim();
  }

  static String? _memoWithoutLocation(String? memo) {
    if (memo == null || !memo.startsWith('[수거 장소] ')) {
      return memo;
    }
    final lines = memo.split('\n').skip(1).join('\n').trim();
    return lines.isEmpty ? null : lines;
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

  static double _asDouble(Object? value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
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
