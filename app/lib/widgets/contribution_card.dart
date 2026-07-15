import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'app_illustration.dart';
import 'progress_bar_widget.dart';

class ContributionCard extends StatelessWidget {
  const ContributionCard({
    super.key,
    required this.currentGrams,
    required this.goalGrams,
  });

  final double currentGrams;
  final double goalGrams;

  @override
  Widget build(BuildContext context) {
    final remaining = (goalGrams - currentGrams).clamp(0, goalGrams);
    final progress = currentGrams / goalGrams;
    final pct = (progress.clamp(0.0, 1.0) * 100).toStringAsFixed(0);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.lightGreen,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const AppIllustration(
                    type: IllustrationType.egg,
                    size: 30,
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '내 계란껍질 기여량',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        '승인 완료된 수거량 기준',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.mutedText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${currentGrams.toInt()}',
                  style: const TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    color: AppTheme.primaryGreen,
                  ),
                ),
                const SizedBox(width: 4),
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Text(
                    'g / ${goalGrams.toInt()}g',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.mutedText,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ProgressBarWidget(value: progress),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text.rich(
                    TextSpan(
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.mutedText,
                      ),
                      children: remaining <= 0
                          ? const [
                              TextSpan(
                                text: '꽃 리워드를 받을 수 있어요!',
                                style: TextStyle(
                                  color: AppTheme.primaryGreen,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ]
                          : [
                              const TextSpan(text: '꽃 리워드까지 '),
                              TextSpan(
                                text: '${remaining.toInt()}g',
                                style: const TextStyle(
                                  color: AppTheme.primaryGreen,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const TextSpan(text: ' 남았어요'),
                            ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.lightGreen,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$pct%',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primaryGreen,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
