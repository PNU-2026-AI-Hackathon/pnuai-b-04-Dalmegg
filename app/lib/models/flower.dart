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

  factory Flower.fromJson(Map<String, dynamic> json) {
    return Flower(
      id: json['id'] as int,
      shopId: json['shop_id'] as int? ?? 0,
      name: json['name'] as String,
      price: '${json['price']}원',
      location:
          json['shop_name'] as String? ??
          json['location'] as String? ??
          '제휴 꽃집',
      description: json['description'] as String? ?? '',
      emoji: _emojiForColor(json['color'] as String?),
      stock: json['stock_quantity'] as int? ?? 0,
      bgColor: _backgroundForColor(json['color'] as String?),
    );
  }

  static String _emojiForColor(String? color) {
    return switch (color) {
      'red' => '🌹',
      'yellow' => '🌼',
      'pink' => '🌷',
      _ => '🌸',
    };
  }

  static Color _backgroundForColor(String? color) {
    return switch (color) {
      'red' => const Color(0xFFFFEBEE),
      'yellow' => const Color(0xFFFFFDE7),
      'pink' => const Color(0xFFFCE4EC),
      _ => const Color(0xFFFCE4F0),
    };
  }
}
