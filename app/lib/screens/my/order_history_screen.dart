import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/flower.dart';
import '../../models/order_record.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_illustration.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<EggBloomState>();
    final flowersById = {for (final flower in state.flowers) flower.id: flower};

    return Scaffold(
      appBar: AppBar(title: const Text('꽃 주문 내역')),
      body: RefreshIndicator(
        onRefresh: state.loadInitialData,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 28),
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  AppIllustration(type: IllustrationType.flowerShop, size: 44),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '꽃마켓에서 주문한 상품과 결제 금액을 확인할 수 있어요.',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            if (state.isLoading && state.orders.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (state.orders.isEmpty)
              const _EmptyOrders()
            else
              ...state.orders.map(
                (order) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _OrderCard(order: order, flowersById: flowersById),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _EmptyOrders extends StatelessWidget {
  const _EmptyOrders();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 36),
        child: Column(
          children: [
            AppIllustration(type: IllustrationType.flowerShop, size: 64),
            SizedBox(height: 10),
            Text(
              '아직 주문 내역이 없습니다.',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
            SizedBox(height: 4),
            Text(
              '꽃마켓에서 마음에 드는 꽃을 만나보세요.',
              style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order, required this.flowersById});

  final OrderRecord order;
  final Map<int, Flower> flowersById;

  @override
  Widget build(BuildContext context) {
    final isCancelled = order.status == 'cancelled';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '주문 #${order.id}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        order.formattedDate,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.mutedText,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: isCancelled
                        ? AppTheme.warmMuted
                        : AppTheme.lightGreen,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    order.statusLabel,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isCancelled
                          ? AppTheme.mutedText
                          : AppTheme.primaryGreen,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            ...order.items.map((item) {
              final flower = flowersById[item.flowerId];
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: flower?.bgColor ?? AppTheme.pinkSurface,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        flower?.emoji ?? '🌸',
                        style: const TextStyle(fontSize: 22),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            flower?.name ?? '꽃 상품 #${item.flowerId}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            '${item.quantity}개',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppTheme.mutedText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      item.formattedLineAmount,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              );
            }),
            const Divider(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '총 ${order.items.fold<int>(0, (sum, item) => sum + item.quantity)}개',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.mutedText,
                  ),
                ),
                Text(
                  order.formattedTotalAmount,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppTheme.primaryGreen,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
