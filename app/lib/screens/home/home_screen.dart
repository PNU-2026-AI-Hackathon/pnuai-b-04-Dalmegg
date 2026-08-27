import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/flower.dart';
import '../../models/program.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_illustration.dart';
import '../../widgets/contribution_card.dart';
import '../../widgets/grade_card.dart';
import '../../widgets/flower_image.dart';
import '../../widgets/section_header.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

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
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(28),
                ),
              ),
              padding: const EdgeInsets.fromLTRB(20, 60, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        '닮은살걀',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const AppIllustration(
                          type: IllustrationType.sprout,
                          size: 28,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    '오늘도 자원순환에\n참여해볼까요?',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${state.userName}님 · 리워드 ${state.rewardPoints}P',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
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
                const SizedBox(height: 16),
                GradeCard(totalGrams: state.totalGrams),
                const SizedBox(height: 20),
                SectionHeader(
                  title: '추천 꽃 상품',
                  onMore: () => context.go('/?tab=2'),
                ),
                const SizedBox(height: 10),
                if (state.flowers.isEmpty)
                  _LoadingCard(
                    label: state.isLoading
                        ? '추천 꽃 상품을 불러오는 중입니다.'
                        : '현재 등록된 꽃 상품이 없습니다.',
                  )
                else
                  SizedBox(
                    height: 180,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: state.flowers.take(3).length,
                      separatorBuilder: (_, _) => const SizedBox(width: 10),
                      itemBuilder: (context, index) =>
                          _MiniFlowerCard(flower: state.flowers[index]),
                    ),
                  ),
                const SizedBox(height: 20),
                SectionHeader(
                  title: '추천 꽃꾸 체험',
                  onMore: () => context.go('/?tab=3'),
                ),
                const SizedBox(height: 10),
                if (state.programs.isEmpty)
                  _LoadingCard(
                    label: state.isLoading
                        ? '추천 체험을 불러오는 중입니다.'
                        : '현재 등록된 체험이 없습니다.',
                  )
                else
                  _FeaturedProgramCard(program: state.programs.first),
                const SizedBox(height: 16),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  const _LoadingCard({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppTheme.mutedText),
        ),
      ),
    );
  }
}

class _MiniFlowerCard extends StatelessWidget {
  const _MiniFlowerCard({required this.flower});

  final Flower flower;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 136,
      child: Material(
        color: Colors.white,
        elevation: 2,
        shadowColor: Colors.black26,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          key: ValueKey('recommended-flower-${flower.id}'),
          onTap: () {
            if (flower.shopId > 0) {
              context.push('/market/${flower.shopId}');
            } else {
              context.go('/?tab=2');
            }
          },
          child: Semantics(
            button: true,
            label: '${flower.name} 구매 화면 열기',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 92,
                  width: double.infinity,
                  alignment: Alignment.center,
                  color: flower.bgColor,
                  child: FlowerImage(flower: flower, illustrationSize: 70),
                ),
                Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        flower.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        flower.price,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primaryGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FeaturedProgramCard extends StatelessWidget {
  const _FeaturedProgramCard({required this.program});

  final Program program;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 2,
      shadowColor: Colors.black26,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        key: ValueKey('recommended-program-${program.id}'),
        onTap: () => context.go('/?tab=3'),
        child: Semantics(
          button: true,
          label: '${program.title} 예약 화면 열기',
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: AppTheme.lightGreen,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const AppIllustration(
                    type: IllustrationType.flowerClass,
                    size: 48,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        program.title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        program.date,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.mutedText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${program.price} · 잔여 ${program.remainingSpots}자리',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.primaryGreen,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppTheme.mutedText,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
