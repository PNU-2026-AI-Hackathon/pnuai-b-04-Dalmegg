import 'package:flutter/material.dart';

class Flower {
  const Flower({
    required this.id,
    required this.shopId,
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
    return Flower(
      id: json['id'] as int,
      shopId: json['shop_id'] as int? ?? 0,
      name: json['name'] as String,
      price: _formatWon(json['price']),
      location:
          json['shop_name'] as String? ??
          json['location'] as String? ??
          '제휴 꽃집',
      description: json['description'] as String? ?? '',
      emoji: _emojiForColor(json['color'] as String?),
      stock: json['stock_quantity'] as int? ?? 0,
      bgColor: _backgroundForColor(json['color'] as String?),
      imageUrl: json['image_url'] as String?,
    );
  }

  static String _emojiForColor(String? color) {
    return switch (color?.toLowerCase()) {
      'red' || '레드' => '🌹',
      'yellow' || '옐로' || '노랑' => '🌼',
      'pink' || '핑크' || '분홍' => '🌷',
      _ => '🌸',
    };
  }

  static Color _backgroundForColor(String? color) {
    return switch (color?.toLowerCase()) {
      'red' || '레드' => const Color(0xFFFFEBEE),
      'yellow' || '옐로' || '노랑' => const Color(0xFFFFFDE7),
      'pink' || '핑크' || '분홍' => const Color(0xFFFCE4EC),
      _ => const Color(0xFFFCE4F0),
    };
  }

  static String _formatWon(Object? value) {
    final amount = value is num
        ? value.round()
        : double.tryParse(value?.toString() ?? '')?.round() ?? 0;
    final digits = amount.toString();
    final formatted = digits.replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
    return '$formatted원';
  }
}
