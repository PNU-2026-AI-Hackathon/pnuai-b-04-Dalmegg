import 'package:flutter_test/flutter_test.dart';

import 'package:app/main.dart';

void main() {
  testWidgets('MVP app shows home dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(const EggBloomApp(useMockRepositories: true));
    await tester.pumpAndSettle();

    expect(find.text('Egg Bloom'), findsOneWidget);
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
}
