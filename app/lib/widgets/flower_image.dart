import 'package:flutter/material.dart';

import '../models/flower.dart';
import 'app_illustration.dart';

class FlowerImage extends StatelessWidget {
  const FlowerImage({
    super.key,
    required this.flower,
    this.illustrationSize = 72,
  });

  final Flower flower;
  final double illustrationSize;

  @override
  Widget build(BuildContext context) {
    final imageUrl = flower.imageUrl;
    if (imageUrl == null || imageUrl.isEmpty) {
      return _fallback();
    }

    return Image.network(
      imageUrl,
      width: double.infinity,
      height: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => _fallback(),
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Stack(
          alignment: Alignment.center,
          children: [
            _fallback(),
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ],
        );
      },
    );
  }

  Widget _fallback() {
    return ColoredBox(
      color: flower.bgColor,
      child: Center(
        child: AppIllustration(
          type: illustrationForFlower(flower.name, flower.emoji),
          size: illustrationSize,
        ),
      ),
    );
  }
}
