import 'package:flutter/material.dart';

import '../models/program.dart';
import '../theme/app_theme.dart';
import 'app_illustration.dart';
import 'progress_bar_widget.dart';

class ProgramCard extends StatelessWidget {
  const ProgramCard({
    super.key,
    required this.program,
    required this.booked,
    required this.onReserve,
  });

  final Program program;
  final bool booked;
  final VoidCallback onReserve;

  @override
  Widget build(BuildContext context) {
    final fillRate =
        (program.totalSpots - program.remainingSpots) / program.totalSpots;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                height: 124,
                width: double.infinity,
                alignment: Alignment.center,
                color: AppTheme.purpleBg,
                child: const AppIllustration(
                  type: IllustrationType.flowerClass,
                  size: 92,
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: booked ? AppTheme.primaryGreen : program.tagColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    booked ? '예약완료' : program.tag,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.88),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '잔여 ${program.remainingSpots}자리',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.warmBlack,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  program.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  program.description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.mutedText,
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 10),
                _infoRow(Icons.calendar_month_outlined, program.date),
                const SizedBox(height: 4),
                _infoRow(Icons.location_on_outlined, program.location),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '예약 현황',
                      style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
                    ),
                    Text(
                      '${program.totalSpots - program.remainingSpots}/${program.totalSpots}명',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ProgressBarWidget(value: fillRate),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      program.price,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                    booked
                        ? Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 9,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.lightGreen,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              '예약 완료',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primaryGreen,
                              ),
                            ),
                          )
                        : ElevatedButton(
                            onPressed: () {
                              onReserve();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('예약이 완료되었습니다')),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(96, 42),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                            ),
                            child: const Text('예약하기'),
                          ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) => Row(
    children: [
      Icon(icon, size: 13, color: AppTheme.mutedText),
      const SizedBox(width: 5),
      Expanded(
        child: Text(
          text,
          style: const TextStyle(fontSize: 12, color: AppTheme.warmBlack),
        ),
      ),
    ],
  );
}
