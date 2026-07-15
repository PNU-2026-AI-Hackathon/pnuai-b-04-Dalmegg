import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_illustration.dart';
import '../../widgets/program_card.dart';

class ExperienceScreen extends StatelessWidget {
  const ExperienceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final programs = context.watch<EggBloomState>().programs;

    return Scaffold(
      appBar: AppBar(title: const Text('꽃꾸 체험 예약')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.purpleBg, AppTheme.lightGreen],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                AppIllustration(type: IllustrationType.calendar, size: 62),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '순환 플라워팜 체험',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.warmBlack,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '계란껍질 비료로 자란 꽃을 직접 꾸미고 배워보세요.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.mutedText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          ...programs.map(
            (program) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: ProgramCard(
                program: program,
                booked: context.select<EggBloomState, bool>(
                  (state) =>
                      state.reservations.any((item) => item.id == program.id),
                ),
                onReserve: () {
                  context.read<EggBloomState>().reserveProgram(program);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
