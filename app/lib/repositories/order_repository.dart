import '../core/api_client.dart';
import '../models/order_record.dart';

class OrderItemRequest {
  const OrderItemRequest({required this.flowerId, required this.quantity});

  final int flowerId;
  final int quantity;

  Map<String, dynamic> toJson() {
    return {'flower_id': flowerId, 'quantity': quantity};
  }
}

abstract class OrderRepository {
  Future<List<OrderRecord>> fetchMyOrders();
  Future<OrderRecord> createOrder({required List<OrderItemRequest> items});
}

class MockOrderRepository implements OrderRepository {
  const MockOrderRepository();

  @override
  Future<List<OrderRecord>> fetchMyOrders() async => [
    OrderRecord(
      id: 101,
      totalAmount: 10400,
      status: 'paid',
      createdAt: DateTime(2026, 8, 27, 13, 30),
      items: const [
        OrderLine(flowerId: 1, quantity: 2, unitPrice: 5200, lineAmount: 10400),
      ],
    ),
  ];

  @override
  Future<OrderRecord> createOrder({
    required List<OrderItemRequest> items,
  }) async {
    const prices = {1: 5200, 2: 6800, 3: 8500, 4: 4500};
    final lines = items.map((item) {
      final unitPrice = prices[item.flowerId] ?? 0;
      return OrderLine(
        flowerId: item.flowerId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        lineAmount: unitPrice * item.quantity,
      );
    }).toList();
    return OrderRecord(
      id: DateTime.now().millisecondsSinceEpoch,
      totalAmount: lines.fold(0, (sum, line) => sum + line.lineAmount),
      status: 'paid',
      createdAt: DateTime.now(),
      items: lines,
    );
  }
}

class ApiOrderRepository implements OrderRepository {
  const ApiOrderRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<List<OrderRecord>> fetchMyOrders() async {
    final list = await apiClient.getList('/api/orders');
    return list
        .whereType<Map<String, dynamic>>()
        .map(OrderRecord.fromJson)
        .toList();
  }

  @override
  Future<OrderRecord> createOrder({
    required List<OrderItemRequest> items,
  }) async {
    final json = await apiClient.postJson(
      '/api/orders',
      body: {'items': items.map((item) => item.toJson()).toList()},
    );
    return OrderRecord.fromJson(json);
  }
}
