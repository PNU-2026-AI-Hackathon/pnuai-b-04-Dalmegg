import 'package:flutter/material.dart';

import '../models/flower.dart';
import '../theme/app_theme.dart';
import 'app_illustration.dart';

class FlowerCard extends StatefulWidget {
  const FlowerCard({super.key, required this.flower, required this.onBuy});

  final Flower flower;
  final Future<void> Function(int quantity) onBuy;

  @override
  State<FlowerCard> createState() => _FlowerCardState();
}

class _FlowerCardState extends State<FlowerCard> {
  bool _requested = false;

  @override
  Widget build(BuildContext context) {
    final stockRatio = (widget.flower.stock / 20).clamp(0.0, 1.0);
    final stockColor = widget.flower.stock <= 5
        ? const Color(0xFFE57373)
        : AppTheme.primaryGreen;
    final illustration = illustrationForFlower(
      widget.flower.name,
      widget.flower.emoji,
    );

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                height: 140,
                width: double.infinity,
                color: widget.flower.bgColor,
                child: Center(
                  child: AppIllustration(type: illustration, size: 92),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.inventory_2_outlined,
                        size: 10,
                        color: AppTheme.mutedText,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '재고 ${widget.flower.stock}개',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.flower.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(
                                Icons.location_on_outlined,
                                size: 11,
                                color: AppTheme.mutedText,
                              ),
                              Expanded(
                                child: Text(
                                  widget.flower.location,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.mutedText,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Text(
                      widget.flower.price,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  widget.flower.description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.mutedText,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '재고 현황',
                      style: TextStyle(fontSize: 11, color: AppTheme.mutedText),
                    ),
                    Text(
                      '${widget.flower.stock}개 남음',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: stockColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: stockRatio,
                    minHeight: 8,
                    backgroundColor: AppTheme.warmMuted,
                    valueColor: AlwaysStoppedAnimation<Color>(stockColor),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: _requested
                      ? OutlinedButton(
                          onPressed: () => setState(() => _requested = false),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.primaryGreen,
                            side: const BorderSide(
                              color: AppTheme.primaryGreen,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('구매 요청됨'),
                        )
                      : ElevatedButton(
                          onPressed: widget.flower.stock <= 0
                              ? null
                              : _openQuantitySheet,
                          child: const Text('구매 요청'),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openQuantitySheet() async {
    final messenger = ScaffoldMessenger.of(context);
    final quantity = await showModalBottomSheet<int>(
      context: context,
      showDragHandle: true,
      builder: (context) => _QuantitySheet(flower: widget.flower),
    );

    if (quantity == null || quantity <= 0) {
      return;
    }

    await widget.onBuy(quantity);
    if (!mounted) return;
    setState(() => _requested = true);
    messenger.showSnackBar(
      SnackBar(
        content: Text('${widget.flower.name} $quantity개 구매 요청이 완료되었습니다'),
      ),
    );
  }
}

class _QuantitySheet extends StatefulWidget {
  const _QuantitySheet({required this.flower});

  final Flower flower;

  @override
  State<_QuantitySheet> createState() => _QuantitySheetState();
}

class _QuantitySheetState extends State<_QuantitySheet> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final unitPrice = _parsePrice(widget.flower.price);
    final totalPrice = unitPrice * _quantity;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.flower.name,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            Text(
              '${widget.flower.price} · 재고 ${widget.flower.stock}개',
              style: const TextStyle(fontSize: 12, color: AppTheme.mutedText),
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '구매 수량',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                Row(
                  children: [
                    _StepButton(
                      icon: Icons.remove,
                      enabled: _quantity > 1,
                      onTap: () => setState(() => _quantity -= 1),
                    ),
                    SizedBox(
                      width: 54,
                      child: Text(
                        '$_quantity',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    _StepButton(
                      icon: Icons.add,
                      enabled: _quantity < widget.flower.stock,
                      primary: true,
                      onTap: () => setState(() => _quantity += 1),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '예상 금액',
                    style: TextStyle(fontSize: 13, color: AppTheme.mutedText),
                  ),
                  Text(
                    '${_formatPrice(totalPrice)}원',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.primaryGreen,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(_quantity),
                child: const Text('구매 요청하기'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  int _parsePrice(String price) {
    final digits = price.replaceAll(RegExp('[^0-9]'), '');
    return int.tryParse(digits) ?? 0;
  }

  String _formatPrice(int price) {
    final text = price.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < text.length; i++) {
      final reverseIndex = text.length - i;
      buffer.write(text[i]);
      if (reverseIndex > 1 && reverseIndex % 3 == 1) {
        buffer.write(',');
      }
    }
    return buffer.toString();
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.enabled,
    required this.onTap,
    this.primary = false,
  });

  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final background = primary ? AppTheme.primaryGreen : AppTheme.warmMuted;
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Opacity(
        opacity: enabled ? 1 : 0.35,
        child: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            size: 18,
            color: primary ? Colors.white : AppTheme.warmBlack,
          ),
        ),
      ),
    );
  }
}
