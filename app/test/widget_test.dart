import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/features/market/market_detail_screen.dart';
import 'package:app/main.dart';
import 'package:app/models/flower.dart';

void main() {
  testWidgets('MVP app shows home dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(const EggBloomApp(useMockRepositories: true));
    await tester.pumpAndSettle();

    expect(find.text('닮은살걀'), findsOneWidget);
    expect(find.text('내 계란껍질 기여량'), findsOneWidget);
    expect(find.textContaining('오늘도 자원순환에'), findsOneWidget);
  });

  testWidgets('demo mode shows market and experience lists', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const EggBloomApp(useMockRepositories: true));
    await tester.pumpAndSettle();

    await tester.tap(find.text('꽃마켓'));
    await tester.pumpAndSettle();
    expect(find.text('도화농장 플라워'), findsOneWidget);
    expect(find.text('부산대 스마트팜'), findsOneWidget);

    await tester.tap(find.text('체험예약'));
    await tester.pumpAndSettle();
    expect(find.text('ESG 꽃꾸 클래스'), findsOneWidget);
  });

  testWidgets('home recommendations open purchase and reservation screens', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const EggBloomApp(useMockRepositories: true));
    await tester.pumpAndSettle();
    await tester.tap(find.text('홈'));
    await tester.pumpAndSettle();
    await tester.drag(find.byType(CustomScrollView), const Offset(0, -450));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('recommended-flower-1')));
    await tester.pumpAndSettle();
    expect(find.byType(MarketDetailScreen), findsOneWidget);
    expect(find.text('계란껍질 비료로 재배한 계절 꽃을 판매하는 제휴 농장입니다.'), findsOneWidget);
    expect(find.text('010-1234-5678'), findsOneWidget);
    expect(find.text('영업시간'), findsNothing);
    expect(find.text('최소주문'), findsNothing);

    await tester.tap(find.byIcon(Icons.arrow_back_rounded));
    await tester.pumpAndSettle();
    await tester.drag(
      find.byType(CustomScrollView).first,
      const Offset(0, -450),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('recommended-program-1')));
    await tester.pumpAndSettle();

    expect(find.text('순환 플라워팜 체험'), findsOneWidget);
    expect(find.text('예약하기'), findsWidgets);

    await tester.tap(find.text('홈'));
    await tester.pumpAndSettle();
    await tester.drag(find.byType(CustomScrollView), const Offset(0, -900));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('recommended-program-1')));
    await tester.pumpAndSettle();

    expect(find.text('순환 플라워팜 체험'), findsOneWidget);
    expect(find.text('예약하기'), findsWidgets);
  });

  testWidgets('my page opens order history with product details', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const EggBloomApp(useMockRepositories: true));
    await tester.pumpAndSettle();

    await tester.tap(find.text('마이'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('꽃 주문 내역'), 300);
    await tester.tap(find.text('전체보기'));
    await tester.pumpAndSettle();

    expect(find.text('꽃 주문 내역'), findsOneWidget);
    expect(find.text('주문 #101'), findsOneWidget);
    expect(find.text('미니 거베라'), findsOneWidget);
    expect(find.text('10,400원'), findsNWidgets(2));
  });

  testWidgets('out of stock flower disables add action', (
    WidgetTester tester,
  ) async {
    var added = false;
    const flower = Flower(
      id: 13,
      shopId: 3,
      name: '레드 장미',
      price: '4,300원',
      location: '서면 온실',
      description: '선명한 빨간 장미',
      emoji: '🌹',
      stock: 0,
      bgColor: Color(0xFFFFEBEE),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: FlowerProductCard(product: flower, quantity: 0, onAdd: null),
        ),
      ),
    );

    expect(find.text('품절'), findsOneWidget);
    expect(find.text('선명한 빨간 장미'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.block_rounded));
    expect(added, isFalse);
  });
}
