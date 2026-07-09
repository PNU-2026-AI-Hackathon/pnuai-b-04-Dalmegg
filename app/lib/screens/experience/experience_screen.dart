import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../main.dart';
import '../../theme/app_theme.dart';
import '../../widgets/program_card.dart';

class ExperienceScreen extends StatelessWidget {
  const ExperienceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final programs = context.watch<EggBloomState>().programs;

    return Scaffold(
      appBar: AppBar(title: const Text('꽃꾸 체험 예약 🎨')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.lightGreen,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: [
                Icon(Icons.calendar_month, color: AppTheme.primaryGreen),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '수거 참여로 이어진 순환 플라워팜 체험 프로그램을 예약해보세요.',
                    style: TextStyle(fontSize: 12),
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
                  (state) => state.reservations.any(
                    (item) => item.title == program.title,
                  ),
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
