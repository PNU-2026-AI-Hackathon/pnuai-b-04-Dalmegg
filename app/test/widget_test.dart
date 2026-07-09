import 'package:flutter_test/flutter_test.dart';

import 'package:app/main.dart';

void main() {
  testWidgets('MVP app shows home dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(const EggBloomApp());

    expect(find.text('Egg Bloom'), findsOneWidget);
    expect(find.text('내 계란껍질 기여량'), findsOneWidget);
    expect(find.text('추천 꽃 상품'), findsOneWidget);
  });
}
