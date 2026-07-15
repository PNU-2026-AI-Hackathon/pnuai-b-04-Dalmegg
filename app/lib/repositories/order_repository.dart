import '../core/api_client.dart';

class OrderItemRequest {
  const OrderItemRequest({required this.flowerId, required this.quantity});

  final int flowerId;
  final int quantity;

  Map<String, dynamic> toJson() {
    return {'flower_id': flowerId, 'quantity': quantity};
  }
}

abstract class OrderRepository {
  Future<void> createOrder({required List<OrderItemRequest> items});
}

class MockOrderRepository implements OrderRepository {
  const MockOrderRepository();

  @override
  Future<void> createOrder({required List<OrderItemRequest> items}) async {}
}

class ApiOrderRepository implements OrderRepository {
  const ApiOrderRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<void> createOrder({required List<OrderItemRequest> items}) async {
    await apiClient.postJson(
      '/api/orders',
      body: {'items': items.map((item) => item.toJson()).toList()},
    );
  }
}
