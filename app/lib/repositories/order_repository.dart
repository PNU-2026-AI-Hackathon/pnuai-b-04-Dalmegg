import '../core/api_client.dart';

abstract class OrderRepository {
  Future<void> createOrder({required int flowerId, int quantity = 1});
}

class MockOrderRepository implements OrderRepository {
  const MockOrderRepository();

  @override
  Future<void> createOrder({required int flowerId, int quantity = 1}) async {}
}

class ApiOrderRepository implements OrderRepository {
  const ApiOrderRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<void> createOrder({required int flowerId, int quantity = 1}) async {
    await apiClient.postJson(
      '/api/orders',
      body: {
        'items': [
          {'flower_id': flowerId, 'quantity': quantity},
        ],
      },
    );
  }
}
