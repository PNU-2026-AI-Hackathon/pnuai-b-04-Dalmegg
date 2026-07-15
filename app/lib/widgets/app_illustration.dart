import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

enum IllustrationType {
  egg,
  sprout,
  recycle,
  bouquet,
  smartFarm,
  flowerShop,
  flowerClass,
  flowerGerbera,
  flowerTulip,
  flowerFreesia,
  flowerHydrangea,
  collectionBox,
  calendar,
}

IllustrationType illustrationForFlower(String name, String emoji) {
  if (name.contains('튤립') || emoji == '🌷') {
    return IllustrationType.flowerTulip;
  }
  if (name.contains('프리지아') || emoji == '🌼') {
    return IllustrationType.flowerFreesia;
  }
  if (name.contains('수국')) {
    return IllustrationType.flowerHydrangea;
  }
  return IllustrationType.flowerGerbera;
}

class AppIllustration extends StatelessWidget {
  const AppIllustration({
    super.key,
    required this.type,
    this.size = 64,
    this.backgroundColor,
  });

  final IllustrationType type;
  final double size;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _IllustrationPainter(type, backgroundColor)),
    );
  }
}

class _IllustrationPainter extends CustomPainter {
  const _IllustrationPainter(this.type, this.backgroundColor);

  final IllustrationType type;
  final Color? backgroundColor;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.shortestSide;
    final scale = s / 80;
    canvas.save();
    canvas.scale(scale);

    final bg = backgroundColor;
    if (bg != null) {
      final paint = Paint()..color = bg;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(4, 4, 72, 72),
          const Radius.circular(18),
        ),
        paint,
      );
    }

    switch (type) {
      case IllustrationType.egg:
        _egg(canvas);
      case IllustrationType.sprout:
        _sprout(canvas);
      case IllustrationType.recycle:
        _recycle(canvas);
      case IllustrationType.bouquet:
        _bouquet(canvas);
      case IllustrationType.smartFarm:
        _smartFarm(canvas);
      case IllustrationType.flowerShop:
        _flowerShop(canvas);
      case IllustrationType.flowerClass:
        _flowerClass(canvas);
      case IllustrationType.flowerGerbera:
        _flowerGerbera(canvas);
      case IllustrationType.flowerTulip:
        _flowerTulip(canvas);
      case IllustrationType.flowerFreesia:
        _flowerFreesia(canvas);
      case IllustrationType.flowerHydrangea:
        _flowerHydrangea(canvas);
      case IllustrationType.collectionBox:
        _collectionBox(canvas);
      case IllustrationType.calendar:
        _calendar(canvas);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _IllustrationPainter oldDelegate) {
    return oldDelegate.type != type ||
        oldDelegate.backgroundColor != backgroundColor;
  }

  Paint _paint(Color color) => Paint()..color = color;

  void _egg(Canvas c) {
    final outer = Path()
      ..moveTo(11, 43)
      ..lineTo(19, 37)
      ..lineTo(15, 29)
      ..lineTo(24, 21)
      ..lineTo(32, 29)
      ..lineTo(27, 37)
      ..lineTo(35, 44)
      ..lineTo(40, 37)
      ..lineTo(46, 44)
      ..lineTo(54, 37)
      ..lineTo(60, 44)
      ..lineTo(67, 39)
      ..quadraticBezierTo(70, 58, 58, 68)
      ..quadraticBezierTo(40, 79, 22, 68)
      ..quadraticBezierTo(10, 58, 11, 43)
      ..close();
    c.drawPath(outer, _paint(AppTheme.eggGold));
    c.drawOval(
      const Rect.fromLTWH(26, 54, 14, 8),
      _paint(Colors.white.withValues(alpha: 0.45)),
    );
  }

  void _sprout(Canvas c) {
    c.drawOval(
      const Rect.fromLTWH(18, 62, 44, 12),
      _paint(const Color(0xFFC8A882)),
    );
    c.drawLine(
      const Offset(40, 64),
      const Offset(40, 36),
      Paint()
        ..color = AppTheme.primaryGreen
        ..strokeWidth = 4
        ..strokeCap = StrokeCap.round,
    );
    c.drawOval(
      const Rect.fromLTWH(22, 34, 22, 14),
      _paint(AppTheme.greenLight),
    );
    c.drawOval(
      const Rect.fromLTWH(39, 25, 24, 15),
      _paint(AppTheme.primaryGreen),
    );
    c.drawOval(const Rect.fromLTWH(34, 28, 12, 16), _paint(AppTheme.greenPale));
  }

  void _recycle(Canvas c) {
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;
    for (final item in [
      (0.0, AppTheme.primaryGreen),
      (2.1, AppTheme.greenLight),
      (4.2, AppTheme.greenPale),
    ]) {
      p.color = item.$2;
      c.drawArc(const Rect.fromLTWH(16, 16, 48, 48), item.$1, 1.45, false, p);
    }
  }

  void _bouquet(Canvas c) {
    final wrap = Path()
      ..moveTo(24, 50)
      ..lineTo(40, 74)
      ..lineTo(56, 50)
      ..close();
    c.drawPath(wrap, _paint(AppTheme.blushPink));
    for (final x in [33.0, 40.0, 47.0]) {
      c.drawLine(
        Offset(x, 50),
        Offset(x, x == 40 ? 30 : 34),
        Paint()
          ..color = AppTheme.primaryGreen
          ..strokeWidth = 2.5
          ..strokeCap = StrokeCap.round,
      );
    }
    c.drawCircle(const Offset(33, 30), 9, _paint(AppTheme.blushPink));
    c.drawCircle(const Offset(40, 25), 10, _paint(AppTheme.pinkDeep));
    c.drawCircle(const Offset(47, 30), 9, _paint(AppTheme.blushPink));
    c.drawCircle(const Offset(40, 25), 5, _paint(AppTheme.pinkSurface));
  }

  void _smartFarm(Canvas c) {
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(10, 32, 60, 30),
        const Radius.circular(4),
      ),
      _paint(const Color(0xFFB2DFDB).withValues(alpha: 0.65)),
    );
    final roof = Path()
      ..moveTo(6, 32)
      ..lineTo(40, 10)
      ..lineTo(74, 32)
      ..close();
    c.drawPath(roof, _paint(AppTheme.primaryGreen.withValues(alpha: 0.85)));
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(6, 60, 68, 12),
        const Radius.circular(4),
      ),
      _paint(AppTheme.greenPale),
    );
    c.drawCircle(const Offset(62, 16), 6, _paint(const Color(0xFFFFD54F)));
  }

  void _flowerShop(Canvas c) {
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(8, 30, 64, 42),
        const Radius.circular(4),
      ),
      _paint(const Color(0xFFFFF8F0)),
    );
    final awning = Path()
      ..moveTo(6, 30)
      ..lineTo(74, 30)
      ..lineTo(70, 16)
      ..lineTo(10, 16)
      ..close();
    c.drawPath(awning, _paint(AppTheme.primaryGreen));
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(29, 44, 22, 28),
        const Radius.circular(2),
      ),
      _paint(AppTheme.warmMuted),
    );
    c.drawCircle(const Offset(20, 42), 5, _paint(AppTheme.blushPink));
    c.drawCircle(const Offset(58, 42), 5, _paint(const Color(0xFFFF8A65)));
  }

  void _flowerClass(Canvas c) {
    c.drawPath(
      Path()
        ..moveTo(26, 72)
        ..lineTo(54, 72)
        ..lineTo(58, 52)
        ..lineTo(22, 52)
        ..close(),
      _paint(AppTheme.greenLight),
    );
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(20, 48, 40, 6),
        const Radius.circular(3),
      ),
      _paint(AppTheme.primaryGreen),
    );
    for (final x in [34.0, 40.0, 46.0]) {
      c.drawLine(
        Offset(x, 48),
        Offset(x, x == 40 ? 24 : 30),
        Paint()
          ..color = AppTheme.primaryGreen
          ..strokeWidth = 2.5
          ..strokeCap = StrokeCap.round,
      );
    }
    c.drawCircle(const Offset(34, 27), 8, _paint(const Color(0xFFFF8A65)));
    c.drawCircle(const Offset(40, 21), 9, _paint(AppTheme.blushPink));
    c.drawCircle(const Offset(46, 27), 8, _paint(const Color(0xFFFFF176)));
  }

  void _flowerGerbera(Canvas c) {
    c.drawLine(
      const Offset(40, 68),
      const Offset(40, 45),
      Paint()
        ..color = AppTheme.primaryGreen
        ..strokeWidth = 3.5
        ..strokeCap = StrokeCap.round,
    );
    c.drawOval(
      const Rect.fromLTWH(27, 52, 18, 10),
      _paint(AppTheme.greenLight),
    );
    for (var i = 0; i < 12; i++) {
      final angle = i * 30.0;
      c.save();
      c.translate(40, 32);
      c.rotate(angle * 3.1415926535 / 180);
      c.drawOval(
        const Rect.fromLTWH(14, -5, 9, 18),
        _paint(const Color(0xFFFF8A65).withValues(alpha: 0.9)),
      );
      c.restore();
    }
    c.drawCircle(const Offset(40, 32), 9, _paint(const Color(0xFF4E342E)));
    c.drawCircle(const Offset(40, 32), 5.5, _paint(const Color(0xFF6D4C41)));
    c.drawOval(
      const Rect.fromLTWH(35, 27, 4, 6),
      _paint(Colors.white.withValues(alpha: 0.35)),
    );
  }

  void _flowerTulip(Canvas c) {
    c.drawLine(
      const Offset(40, 68),
      const Offset(40, 38),
      Paint()
        ..color = AppTheme.primaryGreen
        ..strokeWidth = 3.5
        ..strokeCap = StrokeCap.round,
    );
    c.drawPath(
      Path()
        ..moveTo(40, 54)
        ..quadraticBezierTo(28, 49, 27, 38),
      Paint()
        ..color = AppTheme.greenLight
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round,
    );
    c.drawPath(
      Path()
        ..moveTo(40, 38)
        ..quadraticBezierTo(27, 30, 29, 14)
        ..quadraticBezierTo(36, 10, 43, 15)
        ..quadraticBezierTo(44, 28, 40, 38)
        ..close(),
      _paint(AppTheme.pinkDeep),
    );
    c.drawPath(
      Path()
        ..moveTo(40, 38)
        ..quadraticBezierTo(53, 30, 51, 14)
        ..quadraticBezierTo(44, 10, 37, 15)
        ..quadraticBezierTo(36, 28, 40, 38)
        ..close(),
      _paint(AppTheme.pinkDeep),
    );
    c.drawPath(
      Path()
        ..moveTo(40, 38)
        ..quadraticBezierTo(33, 27, 35, 12)
        ..quadraticBezierTo(40, 9, 45, 12)
        ..quadraticBezierTo(47, 27, 40, 38)
        ..close(),
      _paint(AppTheme.blushPink),
    );
  }

  void _flowerFreesia(Canvas c) {
    c.drawPath(
      Path()
        ..moveTo(34, 70)
        ..quadraticBezierTo(32, 52, 30, 24),
      Paint()
        ..color = AppTheme.primaryGreen
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.5
        ..strokeCap = StrokeCap.round,
    );
    c.drawOval(
      const Rect.fromLTWH(21, 8, 18, 22),
      _paint(const Color(0xFFF5D76E)),
    );
    c.drawOval(
      const Rect.fromLTWH(20, 20, 20, 24),
      _paint(const Color(0xFFFFF176)),
    );
    c.drawOval(
      const Rect.fromLTWH(33, 12, 18, 22),
      _paint(const Color(0xFFF5D76E).withValues(alpha: 0.92)),
    );
    c.drawOval(
      const Rect.fromLTWH(14, 28, 16, 20),
      _paint(const Color(0xFFFFF9C4).withValues(alpha: 0.9)),
    );
    c.drawOval(
      const Rect.fromLTWH(27, 32, 6, 8),
      _paint(Colors.white.withValues(alpha: 0.38)),
    );
  }

  void _flowerHydrangea(Canvas c) {
    c.drawLine(
      const Offset(40, 68),
      const Offset(40, 52),
      Paint()
        ..color = AppTheme.primaryGreen
        ..strokeWidth = 3.5
        ..strokeCap = StrokeCap.round,
    );
    for (final item in [
      (const Offset(40, 30), const Color(0xFFC48FD0)),
      (const Offset(29, 34), const Color(0xFFCE93D8)),
      (const Offset(51, 34), const Color(0xFFBA68C8)),
      (const Offset(33, 44), const Color(0xFFD1A8DB)),
      (const Offset(47, 44), const Color(0xFFC48FD0)),
      (const Offset(40, 40), const Color(0xFFB39DDB)),
    ]) {
      c.drawCircle(item.$1, 9, _paint(item.$2.withValues(alpha: 0.9)));
      c.drawCircle(item.$1, 4, _paint(Colors.white.withValues(alpha: 0.55)));
    }
  }

  void _collectionBox(Canvas c) {
    final body = Path()
      ..moveTo(16, 36)
      ..lineTo(20, 72)
      ..lineTo(60, 72)
      ..lineTo(64, 36)
      ..close();
    c.drawPath(body, _paint(AppTheme.greenLight));
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(12, 28, 56, 10),
        const Radius.circular(3),
      ),
      _paint(AppTheme.primaryGreen),
    );
    c.drawOval(
      const Rect.fromLTWH(31, 45, 18, 22),
      _paint(AppTheme.eggGold.withValues(alpha: 0.7)),
    );
  }

  void _calendar(Canvas c) {
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(8, 18, 64, 56),
        const Radius.circular(6),
      ),
      _paint(Colors.white),
    );
    c.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(8, 18, 64, 18),
        const Radius.circular(6),
      ),
      _paint(AppTheme.primaryGreen),
    );
    for (final y in [44.0, 56.0, 68.0]) {
      for (final x in [18.0, 32.0, 46.0, 60.0]) {
        c.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset(x, y), width: 8, height: 6),
            const Radius.circular(2),
          ),
          _paint(AppTheme.warmMuted),
        );
      }
    }
    c.drawCircle(const Offset(46, 56), 7, _paint(AppTheme.blushPink));
  }
}
