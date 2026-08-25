import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_illustration.dart';
import '../../widgets/green_button.dart';
import '../../widgets/progress_bar_widget.dart';

class CollectScreen extends StatefulWidget {
  const CollectScreen({super.key});

  @override
  State<CollectScreen> createState() => _CollectScreenState();
}

class _CollectScreenState extends State<CollectScreen> {
  final _memoController = TextEditingController();
  final List<String> _locations = const [
    '부산대 제휴 수거함',
    '도화농장 수거함',
    '장전동 제휴 카페',
    '직접 제출',
  ];

  String? _selectedLocation;
  int _amount = 0;
  bool _submitted = false;

  @override
  void dispose() {
    _memoController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_selectedLocation == null || _amount <= 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('수거 장소와 제출량을 입력해주세요')));
      return;
    }

    await context.read<EggBloomState>().addCollection(
      location: _selectedLocation!,
      grams: _amount,
      memo: _memoController.text.trim(),
    );
    _memoController.clear();
    setState(() {
      _submitted = true;
      _amount = 0;
    });
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('수거 등록이 완료되었습니다. 관리자 확인 후 반영돼요')),
    );

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _submitted = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final totalGrams = context.watch<EggBloomState>().totalGrams;

    return Scaffold(
      appBar: AppBar(
        title: const Text('수거 등록'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: Colors.grey.shade200),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.lightGreen, AppTheme.pinkSurface],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                AppIllustration(type: IllustrationType.collectionBox, size: 62),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '수거함에 제출한 계란껍질을 등록해요',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.warmBlack,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '관리자 승인 후 누적 기여량과 포인트에 반영됩니다.',
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
          if (_submitted) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: const Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppTheme.primaryGreen,
                    radius: 16,
                    child: Icon(Icons.check, color: Colors.white, size: 16),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '등록 완료!',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2D6A30),
                          ),
                        ),
                        Text(
                          '관리자 확인 후 기여량에 반영돼요',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF4A8A4E),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],
          _FormCard(
            title: '수거 장소',
            child: DropdownButtonFormField<String>(
              initialValue: _selectedLocation,
              hint: const Text('수거 장소를 선택하세요'),
              decoration: const InputDecoration(),
              items: _locations.map((location) {
                return DropdownMenuItem(value: location, child: Text(location));
              }).toList(),
              onChanged: (value) => setState(() => _selectedLocation = value),
            ),
          ),
          const SizedBox(height: 14),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    '제출량',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.warmBlack,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _stepButton(Icons.remove, () {
                        if (_amount >= 10) {
                          setState(() => _amount -= 10);
                        }
                      }),
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              '$_amount',
                              style: const TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.primaryGreen,
                              ),
                            ),
                            const Text(
                              'g',
                              style: TextStyle(color: AppTheme.mutedText),
                            ),
                          ],
                        ),
                      ),
                      _stepButton(
                        Icons.add,
                        () => setState(() => _amount += 10),
                        primary: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  ProgressBarWidget(value: _amount / 500),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        '10g 단위 · 최소 30g 이상 권장',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.mutedText,
                        ),
                      ),
                      Text(
                        '예상 +${(_amount / 2).round()}P',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryGreen,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          _FormCard(
            title: '사진 첨부',
            caption: '선택 사항',
            child: GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('사진 첨부는 다음 버전에서 연결됩니다')),
                );
              },
              child: Container(
                width: double.infinity,
                height: 112,
                decoration: BoxDecoration(
                  color: AppTheme.warmMuted.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.warmBorder),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AppIllustration(type: IllustrationType.egg, size: 44),
                    SizedBox(height: 6),
                    Text(
                      '탭해서 사진 추가',
                      style: TextStyle(fontSize: 13, color: AppTheme.mutedText),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          _FormCard(
            title: '메모',
            caption: '선택 사항',
            child: TextField(
              controller: _memoController,
              maxLines: 3,
              decoration: const InputDecoration(hintText: '특이사항이 있으면 남겨주세요'),
            ),
          ),
          const SizedBox(height: 14),
          if (_selectedLocation != null && _amount > 0) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.greenPale),
              ),
              child: Row(
                children: [
                  const AppIllustration(
                    type: IllustrationType.recycle,
                    size: 42,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '등록 예정 내역',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryGreen,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _selectedLocation!,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          '현재 승인 누적량: ${totalGrams}g · 신청 후 승인 대기',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.mutedText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '+${_amount}g',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.primaryGreen,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],
          GreenButton(label: '수거 참여 등록하기', onPressed: _submit),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _stepButton(
    IconData icon,
    VoidCallback onTap, {
    bool primary = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: primary ? AppTheme.primaryGreen : AppTheme.warmMuted,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          color: primary ? Colors.white : AppTheme.warmBlack,
          size: 18,
        ),
      ),
    );
  }
}

class _FormCard extends StatelessWidget {
  const _FormCard({required this.title, required this.child, this.caption});

  final String title;
  final String? caption;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                if (caption != null) ...[
                  const SizedBox(width: 6),
                  Text(
                    caption!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.mutedText,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            child,
          ],
        ),
      ),
    );
  }
}
