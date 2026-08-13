import 'package:flutter/material.dart';

class Flower {
  const Flower({
    required this.name,
    required this.price,
    required this.location,
    required this.description,
    required this.emoji,
    required this.stock,
    required this.bgColor,
  });

  final String name;
  final String price;
  final String location;
  final String description;
  final String emoji;
  final int stock;
  final Color bgColor;
}
