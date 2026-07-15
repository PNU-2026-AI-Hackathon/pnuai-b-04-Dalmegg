import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../features/market/models/market.dart';
import '../../theme/app_theme.dart';

class MarketCard extends StatelessWidget {
  const MarketCard({super.key, required this.market});

  final Market market;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      clipBehavior: Clip.hardEdge,
      color: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: InkWell(
        onTap: () => context.push('/market/${market.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Container(
                  height: 120,
                  width: double.infinity,
                  color: AppColors.greenBg,
                  alignment: Alignment.center,
                  child: SvgPicture.asset(market.svgAsset, width: 76),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: _MarketBadge(label: market.badge),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: _DistanceBadge(label: market.dist),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 12, 14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          market.name,
                          style: textTheme.titleSmall?.copyWith(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.foreground,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          market.loc,
                          style: textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                            color: AppColors.muted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.muted,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MarketBadge extends StatelessWidget {
  const _MarketBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isBest = label == '베스트';

    return _Pill(
      label: label,
      backgroundColor: isBest ? AppColors.accent : AppColors.primary,
      foregroundColor: isBest ? const Color(0xFF7A2040) : Colors.white,
    );
  }
}

class _DistanceBadge extends StatelessWidget {
  const _DistanceBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return _Pill(
      label: label,
      backgroundColor: Colors.black.withValues(alpha: 0.08),
      foregroundColor: AppColors.foreground,
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  final String label;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: GoogleFonts.notoSansKr(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: foregroundColor,
        ),
      ),
    );
  }
}
