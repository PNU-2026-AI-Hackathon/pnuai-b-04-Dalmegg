import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/collection_record.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_illustration.dart';
import '../../widgets/contribution_card.dart';

class MyScreen extends StatelessWidget {
  const MyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<EggBloomState>();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryGreen,
                    Color(0xFF7DB87F),
                    Color(0xFFA8D5AA),
                  ],
                ),
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(28),
                ),
              ),
              padding: const EdgeInsets.fromLTRB(20, 60, 20, 24),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Center(
                      child: AppIllustration(
                        type: IllustrationType.sprout,
                        size: 50,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          state.userName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const Text(
                          '순환러 ID: eco_1234',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        const SizedBox(height: 6),
                        const _LevelBadge(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                ContributionCard(
                  currentGrams: state.totalGrams.toDouble(),
                  goalGrams: EggBloomState.rewardGoalGrams.toDouble(),
                ),
                const SizedBox(height: 8),
                if (state.rewardReady)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.lightGreen,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      '꽃 리워드를 받을 수 있어요!',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                  ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _StatBox(
                      illustration: IllustrationType.recycle,
                      value: '${state.contributionCount}회',
                      label: '승인 수거',
                    ),
                    const SizedBox(width: 8),
                    _StatBox(
                      illustration: IllustrationType.egg,
                      value: '${state.totalGrams}g',
                      label: '누적 기여',
                    ),
                    const SizedBox(width: 8),
                    _StatBox(
                      illustration: IllustrationType.calendar,
                      value: '${state.reservations.length}건',
                      label: '예약 체험',
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                if (state.pendingContributionCount > 0) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.pinkSurface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '승인 대기 수거 신청 ${state.pendingContributionCount}건',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.warmBlack,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                const Text(
                  '수거 참여 내역',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const SizedBox(height: 10),
                _HistoryCard(state: state),
                const SizedBox(height: 20),
                const Text(
                  '체험 예약 내역',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const SizedBox(height: 10),
                _BookingCard(state: state),
                const SizedBox(height: 24),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.state});

  final EggBloomState state;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: state.collectionRecords.map((record) {
          return ListTile(
            leading: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: AppIllustration(type: IllustrationType.egg, size: 28),
              ),
            ),
            title: Text(
              record.location,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              '${record.date} · ${record.status.label}',
              style: const TextStyle(fontSize: 11),
            ),
            trailing: Text(
              '+${record.grams}g',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                color: record.status == CollectionStatus.rejected
                    ? AppTheme.mutedText
                    : AppTheme.primaryGreen,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.state});

  final EggBloomState state;

  @override
  Widget build(BuildContext context) {
    if (state.reservations.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(18),
          child: Text(
            '아직 예약한 체험이 없습니다.',
            style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
          ),
        ),
      );
    }

    return Card(
      child: Column(
        children: state.reservations.map((program) {
          return ListTile(
            leading: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFFFFDE7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: AppIllustration(
                  type: IllustrationType.flowerClass,
                  size: 28,
                ),
              ),
            ),
            title: Text(
              program.title,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              '${program.date} · ${program.location}',
              style: const TextStyle(fontSize: 11),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                '예약중',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primaryGreen,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox({
    required this.illustration,
    required this.value,
    required this.label,
  });

  final IllustrationType illustration;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Column(
            children: [
              AppIllustration(type: illustration, size: 28),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.warmBlack,
                ),
              ),
              Text(
                label,
                style: const TextStyle(fontSize: 10, color: AppTheme.mutedText),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LevelBadge extends StatelessWidget {
  const _LevelBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white24,
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Text(
        '새싹 Lv.2',
        style: TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
