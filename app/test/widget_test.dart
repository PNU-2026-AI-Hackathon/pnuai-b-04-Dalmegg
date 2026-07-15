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
}
