import 'package:flutter/material.dart';

class Program {
  const Program({
    this.id = 0,
    this.shopId = 0,
    required this.title,
    required this.date,
    required this.location,
    required this.price,
    required this.description,
    required this.tag,
    required this.remainingSpots,
    required this.totalSpots,
    required this.tagColor,
    this.startsAt,
  });

  final int id;
  final int shopId;
  final String title;
  final String date;
  final String location;
  final String price;
  final String description;
  final String tag;
  final int remainingSpots;
  final int totalSpots;
  final Color tagColor;
  final DateTime? startsAt;

  factory Program.fromJson(Map<String, dynamic> json) {
    final startsAt = DateTime.tryParse(json['starts_at'] as String? ?? '')?.toLocal();
    final price = (json['price_per_person'] as num?)?.toDouble() ?? 0;
    return Program(
      id: (json['id'] as num?)?.toInt() ?? 0,
      shopId: (json['shop_id'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? '꽃 체험',
      date: startsAt == null ? '일정 확인 필요' : _formatDate(startsAt),
      location: '스마트팜 #${json['shop_id'] ?? '-'}',
      price: '${FlowerPriceFormatter.format(price)}원',
      description: json['description'] as String? ?? '친환경 꽃 체험 프로그램입니다.',
      tag: ((json['remaining_seats'] as num?)?.toInt() ?? 0) <= 3 ? '마감임박' : '예약가능',
      remainingSpots: (json['remaining_seats'] as num?)?.toInt() ?? 0,
      totalSpots: (json['capacity'] as num?)?.toInt() ?? 1,
      tagColor: ((json['remaining_seats'] as num?)?.toInt() ?? 0) <= 3
          ? Colors.pinkAccent
          : Colors.green,
      startsAt: startsAt,
    );
  }

  static String _formatDate(DateTime value) {
    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
    return '${value.year}년 ${value.month}월 ${value.day}일 '
        '(${weekdays[value.weekday - 1]}) '
        '${value.hour.toString().padLeft(2, '0')}:'
        '${value.minute.toString().padLeft(2, '0')}';
  }
}

class FlowerPriceFormatter {
  static String format(double value) {
    return value.round().toString().replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
  }
}
