import 'package:flutter_test/flutter_test.dart';

import 'package:app/main.dart';

void main() {
  testWidgets('app starts with authentication screen', (WidgetTester tester) async {
    await tester.pumpWidget(const EggBloomApp(initializeOnStart: false));

    expect(find.text('Egg Bloom'), findsOneWidget);
    expect(find.text('로그인'), findsOneWidget);
    expect(find.text('데모 데이터로 둘러보기'), findsOneWidget);
  });
}
