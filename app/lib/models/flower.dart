import 'package:flutter/material.dart';

class Flower {
  const Flower({
    this.id = 0,
    this.shopId = 0,
    required this.name,
    required this.price,
    required this.location,
    required this.description,
    required this.emoji,
    required this.stock,
    required this.bgColor,
    this.imageUrl,
  });

  final int id;
  final int shopId;
  final String name;
  final String price;
  final String location;
  final String description;
  final String emoji;
  final int stock;
  final Color bgColor;
  final String? imageUrl;

  factory Flower.fromJson(Map<String, dynamic> json) {
    final price = (json['price'] as num?)?.toDouble() ?? 0;
    final color = (json['color'] as String?)?.toLowerCase() ?? '';
    final presentation = switch (color) {
      'red' || 'pink' || '빨강' || '분홍' => ('🌹', const Color(0xFFFFEBEE)),
      'yellow' || '노랑' => ('🌼', const Color(0xFFFFFDE7)),
      'purple' || '보라' => ('🪻', const Color(0xFFF3E5F5)),
      _ => ('🌸', const Color(0xFFFCE4EC)),
    };
    return Flower(
      id: (json['id'] as num?)?.toInt() ?? 0,
      shopId: (json['shop_id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? '이름 없는 꽃',
      price: '${_formatPrice(price)}원',
      location: '스마트팜 #${json['shop_id'] ?? '-'}',
      description: json['description'] as String? ?? '친환경 스마트팜에서 재배한 꽃입니다.',
      emoji: presentation.$1,
      stock: (json['stock_quantity'] as num?)?.toInt() ?? 0,
      bgColor: presentation.$2,
      imageUrl: json['image_url'] as String?,
    );
  }

  static String _formatPrice(double value) {
    final digits = value.round().toString();
    return digits.replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
  }
}
