import 'package:flutter/material.dart';

class Program {
  const Program({
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

  final String title;
  final String date;
  final String location;
  final String price;
  final String description;
  final String tag;
  final int remainingSpots;
  final int totalSpots;
  final Color tagColor;
}
