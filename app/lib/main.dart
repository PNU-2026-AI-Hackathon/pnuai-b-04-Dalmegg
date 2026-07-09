import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/app_state.dart';
import 'screens/collect/collect_screen.dart';
import 'screens/experience/experience_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/market/market_screen.dart';
import 'screens/my/my_screen.dart';
import 'theme/app_theme.dart';
import 'widgets/bottom_nav_bar.dart';

void main() => runApp(const EggBloomApp());

class EggBloomApp extends StatelessWidget {
  const EggBloomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => EggBloomState(),
      child: MaterialApp(
        title: 'Egg Bloom',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const MainNavigator(),
      ),
    );
  }
}

class MainNavigator extends StatefulWidget {
  const MainNavigator({super.key});

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    CollectScreen(),
    MarketScreen(),
    ExperienceScreen(),
    MyScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
