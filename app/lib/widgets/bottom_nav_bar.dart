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

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppTheme.primaryGreen,
      unselectedItemColor: Colors.grey,
      backgroundColor: Colors.white,
      selectedFontSize: 12,
      unselectedFontSize: 12,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: '홈'),
        BottomNavigationBarItem(icon: Icon(Icons.recycling), label: '수거등록'),
        BottomNavigationBarItem(icon: Icon(Icons.local_florist), label: '꽃마켓'),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_month),
          label: '체험예약',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: '마이'),
      ],
    );
  }
}
