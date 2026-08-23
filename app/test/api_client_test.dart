import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:app/models/collection_record.dart';
import 'package:app/models/flower.dart';
import 'package:app/models/program.dart';
import 'package:app/services/api_client.dart';

void main() {
  test('authenticated order sends the access token', () async {
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/auth/login')) {
        return http.Response(
          jsonEncode({
            'access_token': 'access-token',
            'refresh_token': 'refresh-token',
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      }
      expect(request.url.path, endsWith('/orders'));
      expect(request.headers['authorization'], 'Bearer access-token');
      return http.Response(
        jsonEncode({'id': 1, 'status': 'pending'}),
        201,
        headers: {'content-type': 'application/json'},
      );
    });
    final api = ApiClient(client: client, baseUrl: 'https://example.test/api');

    await api.login(email: 'user@example.com', password: 'password123');
    await api.orderFlower(7);
  });

  test('API response models map backend fields to app values', () {
    final flower = Flower.fromJson({
      'id': 3,
      'shop_id': 2,
      'name': '장미',
      'price': 8500.0,
      'stock_quantity': 5,
      'color': 'red',
    });
    final program = Program.fromJson({
      'id': 4,
      'shop_id': 2,
      'title': '꽃꾸 클래스',
      'starts_at': '2026-08-24T14:00:00+09:00',
      'capacity': 10,
      'remaining_seats': 3,
      'price_per_person': 15000.0,
    });
    final collection = CollectionRecord.fromJson({
      'id': 5,
      'weight_kg': '0.120',
      'memo': '[부산대 수거함] 깨끗이 세척함',
      'status': 'pending',
      'created_at': '2026-08-24T08:00:00+09:00',
    });

    expect(flower.price, '8,500원');
    expect(flower.stock, 5);
    expect(program.remainingSpots, 3);
    expect(program.price, '15,000원');
    expect(collection.grams, 120);
    expect(collection.location, '부산대 수거함');
  });
}
