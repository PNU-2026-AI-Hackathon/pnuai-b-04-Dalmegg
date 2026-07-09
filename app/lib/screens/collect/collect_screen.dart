import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../main.dart';
import '../../theme/app_theme.dart';
import '../../widgets/green_button.dart';

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

  void _submit() {
    if (_selectedLocation == null || _amount <= 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('수거 장소와 제출량을 입력해주세요')));
      return;
    }

    context.read<EggBloomState>().addCollection(
      location: _selectedLocation!,
      grams: _amount,
    );
    _memoController.clear();
    setState(() {
      _submitted = true;
      _amount = 0;
    });
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('수거 등록이 완료되었습니다')));

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
        title: const Text('수거 참여 등록'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: Colors.grey.shade200),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
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
                          '누적 기여량이 업데이트됐어요',
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
          _label('수거 장소 선택'),
          DropdownButtonFormField<String>(
            initialValue: _selectedLocation,
            hint: const Text('수거 장소를 선택하세요'),
            decoration: const InputDecoration(),
            items: _locations.map((location) {
              return DropdownMenuItem(value: location, child: Text(location));
            }).toList(),
            onChanged: (value) => setState(() => _selectedLocation = value),
          ),
          const SizedBox(height: 16),
          _label('제출량 (g)'),
          Card(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
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
                            fontSize: 36,
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
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            '10g 단위로 입력해요. 최소 30g 이상 권장',
            style: TextStyle(fontSize: 11, color: AppTheme.mutedText),
          ),
          const SizedBox(height: 16),
          _label('사진 첨부 (선택)'),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('사진 첨부는 다음 버전에서 연결됩니다')),
              );
            },
            child: Container(
              width: double.infinity,
              height: 110,
              decoration: BoxDecoration(
                color: AppTheme.warmMuted.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade300, width: 1.5),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt_outlined,
                    size: 28,
                    color: AppTheme.mutedText,
                  ),
                  SizedBox(height: 6),
                  Text(
                    '탭해서 사진 추가',
                    style: TextStyle(fontSize: 13, color: AppTheme.mutedText),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _label('메모 (선택)'),
          TextField(
            controller: _memoController,
            maxLines: 3,
            decoration: const InputDecoration(hintText: '특이사항이 있으면 남겨주세요'),
          ),
          const SizedBox(height: 16),
          if (_selectedLocation != null && _amount > 0) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '등록 예정 내역',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2D6A30),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          _selectedLocation!,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                      Text(
                        '+${_amount}g',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF2D6A30),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '등록 후 누적량: ${totalGrams + _amount}g / 500g',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.primaryGreen,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],
          GreenButton(label: '수거 참여 등록하기 🌱', onPressed: _submit),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(
      text,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
    ),
  );

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
