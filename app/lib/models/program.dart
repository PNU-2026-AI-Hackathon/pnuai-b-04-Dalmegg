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
    this.shopId = 0,
    this.reservationId,
    this.reservationStatus,
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
  final int shopId;
  final int? reservationId;
  final String? reservationStatus;

  bool get canCancelReservation =>
      reservationId != null &&
      (reservationStatus == 'reserved' || reservationStatus == 'confirmed');

  String get reservationStatusLabel {
    return switch (reservationStatus) {
      'confirmed' => '예약 확정',
      'completed' => '참여 완료',
      'cancelled' => '예약 취소',
      'no_show' => '미참여',
      _ => '예약 중',
    };
  }

  factory Program.fromJson(Map<String, dynamic> json) {
    final startsAt = json['starts_at'] as String? ?? '';
    return Program(
      id: json['id'] as int,
      shopId: json['shop_id'] as int? ?? 0,
      title: json['title'] as String,
      date: _formatDate(startsAt),
      location: json['shop_name'] as String? ?? '제휴 공간',
      price: _formatWon(json['price_per_person']),
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
      reservationId: json['id'] as int?,
      reservationStatus: json['status'] as String? ?? 'reserved',
      title: json['program_title'] as String? ?? '예약 프로그램',
      date: _formatDate(
        json['program_date'] as String? ?? json['starts_at'] as String? ?? '',
      ),
      location: json['location'] as String? ?? '제휴 공간',
      price: _formatWon(json['total_amount']),
      description: '예약 상태: ${json['status'] ?? 'reserved'}',
      tag: '예약',
      remainingSpots: 0,
      totalSpots: 1,
      tagColor: Colors.green,
    );
  }

  Program withProgramDetails(Program details) {
    return Program(
      id: details.id,
      shopId: details.shopId,
      title: details.title,
      date: details.date,
      location: details.location,
      price: details.price,
      description: details.description,
      tag: details.tag,
      remainingSpots: details.remainingSpots,
      totalSpots: details.totalSpots,
      tagColor: details.tagColor,
      reservationId: reservationId,
      reservationStatus: reservationStatus,
    );
  }

  Program withReservationStatus(String status) {
    return Program(
      id: id,
      shopId: shopId,
      title: title,
      date: date,
      location: location,
      price: price,
      description: description,
      tag: tag,
      remainingSpots: remainingSpots,
      totalSpots: totalSpots,
      tagColor: tagColor,
      reservationId: reservationId,
      reservationStatus: status,
    );
  }

  Program withLocation(String nextLocation) {
    return Program(
      id: id,
      shopId: shopId,
      title: title,
      date: date,
      location: nextLocation,
      price: price,
      description: description,
      tag: tag,
      remainingSpots: remainingSpots,
      totalSpots: totalSpots,
      tagColor: tagColor,
      reservationId: reservationId,
      reservationStatus: reservationStatus,
    );
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
