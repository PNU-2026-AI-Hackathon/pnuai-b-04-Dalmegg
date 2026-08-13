import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.onMore});

  final String title;
  final VoidCallback? onMore;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppTheme.warmBlack,
          ),
        ),
        if (onMore != null)
          GestureDetector(
            onTap: onMore,
            child: const Text(
              '더보기',
              style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
            ),
          ),
      ],
    );
  }
}
