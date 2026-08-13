import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../main.dart';
import '../../theme/app_theme.dart';
import '../../widgets/flower_card.dart';

class MarketScreen extends StatelessWidget {
  const MarketScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final flowers = context.watch<EggBloomState>().flowers;

    return Scaffold(
      appBar: AppBar(title: const Text('꽃마켓 🌸')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.lightGreen, AppTheme.pinkSurface],
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: [
                Icon(Icons.eco, color: AppTheme.primaryGreen, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '모든 꽃은 계란껍질 비료와 스마트팜 기술로 친환경 재배됩니다.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          ...flowers.map(
            (flower) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: FlowerCard(flower: flower),
            ),
          ),
        ],
      ),
    );
  }
}
