class OrderRecord {
  const OrderRecord({
    required this.id,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    required this.items,
  });

  final int id;
  final int totalAmount;
  final String status;
  final DateTime createdAt;
  final List<OrderLine> items;

  factory OrderRecord.fromJson(Map<String, dynamic> json) {
    return OrderRecord(
      id: json['id'] as int,
      totalAmount: _asInt(json['total_amount']),
      status: json['status'] as String? ?? 'paid',
      createdAt:
          DateTime.tryParse(json['created_at'] as String? ?? '')?.toLocal() ??
          DateTime.fromMillisecondsSinceEpoch(0),
      items: (json['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(OrderLine.fromJson)
          .toList(),
    );
  }

  String get formattedTotalAmount => '${_formatNumber(totalAmount)}원';

  String get formattedDate {
    final month = createdAt.month.toString().padLeft(2, '0');
    final day = createdAt.day.toString().padLeft(2, '0');
    final hour = createdAt.hour.toString().padLeft(2, '0');
    final minute = createdAt.minute.toString().padLeft(2, '0');
    return '${createdAt.year}.$month.$day $hour:$minute';
  }

  String get statusLabel {
    return switch (status) {
      'paid' => '주문 완료',
      'pending' => '처리 대기',
      'confirmed' => '주문 확인',
      'cancelled' => '주문 취소',
      'completed' => '수령 완료',
      _ => status,
    };
  }

  static int _asInt(Object? value) {
    if (value is num) return value.round();
    return double.tryParse(value?.toString() ?? '')?.round() ?? 0;
  }

  static String _formatNumber(int value) {
    return value.toString().replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
  }
}

class OrderLine {
  const OrderLine({
    required this.flowerId,
    required this.quantity,
    required this.unitPrice,
    required this.lineAmount,
  });

  final int flowerId;
  final int quantity;
  final int unitPrice;
  final int lineAmount;

  factory OrderLine.fromJson(Map<String, dynamic> json) {
    return OrderLine(
      flowerId: json['flower_id'] as int,
      quantity: json['quantity'] as int,
      unitPrice: _asInt(json['unit_price']),
      lineAmount: _asInt(json['line_amount']),
    );
  }

  String get formattedLineAmount => '${_formatNumber(lineAmount)}원';

  static int _asInt(Object? value) {
    if (value is num) return value.round();
    return double.tryParse(value?.toString() ?? '')?.round() ?? 0;
  }

  static String _formatNumber(int value) {
    return value.toString().replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
  }
}
