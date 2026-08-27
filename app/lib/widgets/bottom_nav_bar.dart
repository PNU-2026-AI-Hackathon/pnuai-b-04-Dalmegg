import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BottomNavBar extends StatelessWidget {
  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;

  static const _items = [
    _NavItem(Icons.home_rounded, '홈'),
    _NavItem(Icons.recycling_rounded, '수거등록'),
    _NavItem(Icons.local_florist_rounded, '꽃마켓'),
    _NavItem(Icons.calendar_month_rounded, '체험예약'),
    _NavItem(Icons.person_rounded, '마이'),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        height: 76,
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppTheme.warmBorder)),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 12,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          children: List.generate(_items.length, (index) {
            final item = _items[index];
            final selected = currentIndex == index;
            return Expanded(
              child: InkWell(
                onTap: () => onTap(index),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 160),
                      width: 42,
                      height: 30,
                      decoration: BoxDecoration(
                        color: selected
                            ? AppTheme.lightGreen
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Icon(
                        item.icon,
                        size: 20,
                        color: selected
                            ? AppTheme.primaryGreen
                            : AppTheme.mutedText,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      item.label,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: selected
                            ? FontWeight.w800
                            : FontWeight.w500,
                        color: selected
                            ? AppTheme.primaryGreen
                            : AppTheme.mutedText,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem(this.icon, this.label);

  final IconData icon;
  final String label;
}
