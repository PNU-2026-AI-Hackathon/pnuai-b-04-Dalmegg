import 'package:flutter/material.dart';

import '../models/program.dart';
import '../theme/app_theme.dart';
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
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: AppTheme.warmIvory,
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: program.tagColor,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    program.tag,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '잔여 ${program.remainingSpots}자리',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.mutedText,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
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
                const SizedBox(height: 10),
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
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                        ? OutlinedButton(
                            onPressed: null,
                            style: OutlinedButton.styleFrom(
                              disabledForegroundColor: AppTheme.primaryGreen,
                              side: const BorderSide(
                                color: AppTheme.primaryGreen,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('예약 완료'),
                          )
                        : ElevatedButton(
                            onPressed: () {
                              onReserve();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('예약이 완료되었습니다')),
                              );
                            },
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
