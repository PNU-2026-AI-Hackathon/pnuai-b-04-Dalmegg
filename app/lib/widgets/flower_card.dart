import 'package:flutter/material.dart';

import '../models/flower.dart';
import '../theme/app_theme.dart';

class FlowerCard extends StatefulWidget {
  const FlowerCard({super.key, required this.flower});

  final Flower flower;

  @override
  State<FlowerCard> createState() => _FlowerCardState();
}

class _FlowerCardState extends State<FlowerCard> {
  bool _requested = false;

  @override
  Widget build(BuildContext context) {
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
                  child: Text(
                    widget.flower.emoji,
                    style: const TextStyle(fontSize: 60),
                  ),
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
                          onPressed: () {
                            setState(() => _requested = true);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('구매 요청이 완료되었습니다')),
                            );
                          },
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
}
