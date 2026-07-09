import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'models/collection_record.dart';
import 'models/flower.dart';
import 'models/program.dart';
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

class EggBloomState extends ChangeNotifier {
  static const int rewardGoalGrams = 500;

  final String userName = '김순환';
  int totalGrams = 320;

  final List<CollectionRecord> collectionRecords = [
    const CollectionRecord(date: '07.01', location: '부산대 제휴 수거함', grams: 85),
    const CollectionRecord(date: '06.27', location: '장전동 제휴 카페', grams: 120),
    const CollectionRecord(date: '06.22', location: '도화농장 수거함', grams: 115),
  ];

  final List<Program> reservations = [];

  final List<Flower> flowers = const [
    Flower(
      name: '미니 거베라',
      price: '5,200원',
      stock: 14,
      location: '도화농장',
      description: '선명한 색감의 소형 거베라. 화분에 넣어 선물하기 좋아요.',
      emoji: '🌸',
      bgColor: Color(0xFFFCE4EC),
    ),
    Flower(
      name: '봄 튤립',
      price: '6,800원',
      stock: 8,
      location: '도화농장',
      description: '부드러운 파스텔 핑크. 이번 주 한정 수확분이에요.',
      emoji: '🌷',
      bgColor: Color(0xFFFCE4F0),
    ),
    Flower(
      name: '프리미엄 장미',
      price: '8,500원',
      stock: 5,
      location: '부산대 스마트팜',
      description: 'ESG 친환경 인증 재배. 계란껍질 비료로 키웠어요.',
      emoji: '🌹',
      bgColor: Color(0xFFFFEBEE),
    ),
    Flower(
      name: '프리지아',
      price: '4,500원',
      stock: 20,
      location: '부산대 스마트팜',
      description: '은은한 향이 일품. 봄 내음을 그대로 담았어요.',
      emoji: '🌼',
      bgColor: Color(0xFFFFFDE7),
    ),
  ];

  final List<Program> programs = const [
    Program(
      title: 'ESG 꽃꾸 클래스',
      date: '2026년 7월 12일 (일) 14:00',
      location: '부산대 그린스페이스',
      price: '15,000원',
      remainingSpots: 3,
      totalSpots: 12,
      description: '친환경 꽃꾸미기와 ESG 스마트팜 견학을 함께 경험해요.',
      tag: '인기',
      tagColor: Colors.pinkAccent,
    ),
    Program(
      title: '업사이클링 플라워 클래스',
      date: '2026년 7월 19일 (일) 13:00',
      location: '장전동 제휴 스튜디오',
      price: '18,000원',
      remainingSpots: 6,
      totalSpots: 10,
      description: '계란껍질 화분 만들기와 화훼 장식 체험을 진행해요.',
      tag: 'NEW',
      tagColor: Colors.green,
    ),
    Program(
      title: '나만의 미니 꽃다발 만들기',
      date: '2026년 7월 26일 (일) 15:00',
      location: '도화농장 체험동',
      price: '12,000원',
      remainingSpots: 8,
      totalSpots: 15,
      description: '직접 수확한 꽃으로 나만의 꽃다발을 완성해요.',
      tag: '추천',
      tagColor: Colors.amber,
    ),
  ];

  int get remainingGrams {
    final remaining = rewardGoalGrams - totalGrams;
    return remaining > 0 ? remaining : 0;
  }

  bool get rewardReady => totalGrams >= rewardGoalGrams;

  void addCollection({required String location, required int grams}) {
    totalGrams += grams;
    collectionRecords.insert(
      0,
      CollectionRecord(date: '오늘', location: location, grams: grams),
    );
    notifyListeners();
  }

  void reserveProgram(Program program) {
    if (reservations.any((item) => item.title == program.title)) {
      return;
    }
    reservations.insert(0, program);
    notifyListeners();
  }
}
