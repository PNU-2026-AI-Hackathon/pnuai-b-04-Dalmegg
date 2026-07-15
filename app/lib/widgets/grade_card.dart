import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'app_illustration.dart';

class GradeCard extends StatelessWidget {
  const GradeCard({super.key, required this.totalGrams});

  final int totalGrams;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.pinkSurface, Color(0xFFFFF0F5)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: const [
                BoxShadow(color: Colors.black12, blurRadius: 4),
              ],
            ),
            child: const Center(
              child: AppIllustration(type: IllustrationType.egg, size: 34),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '새싹 순환러',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                ),
                Text(
                  '이번 달 참여 3회 · 누적 ${totalGrams}g',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.mutedText,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppTheme.blushPink,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'Lv.2',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
