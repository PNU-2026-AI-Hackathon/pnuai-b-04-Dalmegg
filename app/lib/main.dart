import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/auth/auth_screen.dart';
import 'screens/collect/collect_screen.dart';
import 'screens/experience/experience_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/market/market_screen.dart';
import 'screens/my/my_screen.dart';
import 'state/egg_bloom_state.dart';
import 'theme/app_theme.dart';
import 'widgets/bottom_nav_bar.dart';

void main() => runApp(const EggBloomApp());

class EggBloomApp extends StatelessWidget {
  const EggBloomApp({super.key, this.initializeOnStart = true});

  final bool initializeOnStart;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) {
        final state = EggBloomState();
        if (initializeOnStart) state.initialize();
        return state;
      },
      child: MaterialApp(
        title: 'Egg Bloom',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AppGate(),
      ),
    );
  }
}

class AppGate extends StatelessWidget {
  const AppGate({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<EggBloomState>(
      builder: (_, state, __) {
        if (state.isAuthenticated || state.isGuest) {
          return const MainNavigator();
        }
        return const AuthScreen();
      },
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
    final state = context.watch<EggBloomState>();
    return Scaffold(
      body: Column(
        children: [
          if (state.isOfflineDemo || state.isGuest)
            SafeArea(
              bottom: false,
              child: Material(
                color: const Color(0xFFFFF3CD),
                child: InkWell(
                  onTap: state.isGuest ? state.showLogin : state.loadCatalog,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.cloud_off_outlined, size: 16, color: Color(0xFF7A5B00)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            state.isGuest ? '게스트 데모 모드 · 탭해서 로그인' : '서버 연결 확인 중 · 데모 데이터를 표시합니다',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF7A5B00)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          Expanded(child: IndexedStack(index: _currentIndex, children: _screens)),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
