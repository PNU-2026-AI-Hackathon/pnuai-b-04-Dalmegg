import 'package:flutter/material.dart';

class Program {
  const Program({
    required this.id,
    required this.title,
    required this.date,
    required this.location,
    required this.price,
    required this.description,
    required this.tag,
    required this.remainingSpots,
    required this.totalSpots,
    required this.tagColor,
  });

  final int id;
  final String title;
  final String date;
  final String location;
  final String price;
  final String description;
  final String tag;
  final int remainingSpots;
  final int totalSpots;
  final Color tagColor;

  factory Program.fromJson(Map<String, dynamic> json) {
    final startsAt = json['starts_at'] as String? ?? '';
    return Program(
      id: json['id'] as int,
      title: json['title'] as String,
      date: _formatDate(startsAt),
      location: json['shop_name'] as String? ?? '제휴 공간',
      price: '${json['price_per_person']}원',
      description: json['description'] as String? ?? '',
      tag: (json['remaining_seats'] as int? ?? 0) <= 3 ? '마감임박' : '모집중',
      remainingSpots: json['remaining_seats'] as int? ?? 0,
      totalSpots: json['capacity'] as int? ?? 0,
      tagColor: (json['remaining_seats'] as int? ?? 0) <= 3
          ? Colors.pinkAccent
          : Colors.green,
    );
  }

  factory Program.fromReservationJson(Map<String, dynamic> json) {
    return Program(
      id: json['program_id'] as int,
      title: json['program_title'] as String? ?? '예약 프로그램',
      date: _formatDate(
        json['program_date'] as String? ?? json['starts_at'] as String? ?? '',
      ),
      location: json['location'] as String? ?? '제휴 공간',
      price: '${json['total_amount'] ?? 0}원',
      description: '예약 상태: ${json['status'] ?? 'reserved'}',
      tag: '예약',
      remainingSpots: 0,
      totalSpots: 1,
      tagColor: Colors.green,
    );
  }

  static String _formatDate(String isoDate) {
    final parsed = DateTime.tryParse(isoDate);
    if (parsed == null) {
      return isoDate;
    }
    final hour = parsed.hour.toString().padLeft(2, '0');
    final minute = parsed.minute.toString().padLeft(2, '0');
    return '${parsed.year}년 ${parsed.month}월 ${parsed.day}일 $hour:$minute';
  }
}
