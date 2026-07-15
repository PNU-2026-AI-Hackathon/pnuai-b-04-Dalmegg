import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/flower.dart';
import '../../models/shop.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_illustration.dart';
import '../../widgets/flower_card.dart';

class MarketScreen extends StatelessWidget {
  const MarketScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final shops = context.watch<EggBloomState>().shops;

    return Scaffold(
      appBar: AppBar(title: const Text('꽃마켓')),
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
                AppIllustration(type: IllustrationType.recycle, size: 36),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '제휴 꽃집을 선택하면 해당 마켓에서 판매하는 친환경 꽃을 볼 수 있어요.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          if (shops.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(18),
                child: Text(
                  '제휴 꽃집을 불러오는 중입니다.',
                  style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
                ),
              ),
            )
          else
            ...shops.map(
              (shop) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: _ShopCard(
                  shop: shop,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ShopFlowerScreen(shop: shop),
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class ShopFlowerScreen extends StatelessWidget {
  const ShopFlowerScreen({super.key, required this.shop});

  final Shop shop;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(shop.name)),
      body: FutureBuilder<List<Flower>>(
        future: context.read<EggBloomState>().fetchFlowersByShop(shop.id),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return const Center(child: Text('꽃 목록을 불러오지 못했습니다.'));
          }

          final flowers = snapshot.data ?? [];

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _ShopSummary(shop: shop),
              const SizedBox(height: 14),
              if (flowers.isEmpty)
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(18),
                    child: Text(
                      '현재 판매 중인 꽃이 없습니다.',
                      style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
                    ),
                  ),
                )
              else
                ...flowers.map(
                  (flower) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: FlowerCard(
                      flower: flower,
                      onBuy: (quantity) => context
                          .read<EggBloomState>()
                          .requestFlowerOrder(flower, quantity: quantity),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _ShopCard extends StatelessWidget {
  const _ShopCard({required this.shop, required this.onTap});

  final Shop shop;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 62,
                height: 62,
                decoration: BoxDecoration(
                  color: AppTheme.lightGreen,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const AppIllustration(
                  type: IllustrationType.flowerShop,
                  size: 50,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shop.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${shop.region} · ${shop.address}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.mutedText,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(
                          Icons.star_rounded,
                          size: 15,
                          color: Color(0xFFFFB74D),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '${shop.averageRating.toStringAsFixed(1)} (${shop.reviewCount})',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
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
    );
  }
}

class _ShopSummary extends StatelessWidget {
  const _ShopSummary({required this.shop});

  final Shop shop;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.lightGreen, AppTheme.pinkSurface],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            shop.name,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          Text(
            shop.description,
            style: const TextStyle(fontSize: 12, color: AppTheme.mutedText),
          ),
          const SizedBox(height: 12),
          const Center(
            child: AppIllustration(type: IllustrationType.smartFarm, size: 96),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 14,
                color: AppTheme.primaryGreen,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(shop.address, style: const TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
