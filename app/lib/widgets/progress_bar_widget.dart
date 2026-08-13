import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class ProgressBarWidget extends StatelessWidget {
  const ProgressBarWidget({super.key, required this.value, this.height = 12});

  final double value;
  final double height;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: LinearProgressIndicator(
        value: value.clamp(0.0, 1.0),
        minHeight: height,
        backgroundColor: AppTheme.warmMuted,
        valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryGreen),
      ),
    );
  }
}
