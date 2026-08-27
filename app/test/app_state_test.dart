import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/models/collection_record.dart';
import 'package:app/models/flower.dart';
import 'package:app/models/order_record.dart';
import 'package:app/models/program.dart';
import 'package:app/models/shop.dart';
import 'package:app/providers/app_state.dart';
import 'package:app/repositories/collection_repository.dart';
import 'package:app/repositories/flower_repository.dart';
import 'package:app/repositories/order_repository.dart';
import 'package:app/repositories/program_repository.dart';
import 'package:app/repositories/reservation_repository.dart';
import 'package:app/repositories/shop_repository.dart';
import 'package:app/repositories/user_repository.dart';

void main() {
  const program = Program(
    id: 7,
    shopId: 3,
    title: '꽃다발 만들기',
    date: '2026년 8월 30일 14:00',
    location: '서면 온실',
    price: '30,000원',
    description: '체험 프로그램',
    tag: '모집중',
    remainingSpots: 4,
    totalSpots: 10,
    tagColor: Colors.green,
  );

  test('한 API가 실패해도 공개 꽃집과 체험 데이터는 유지한다', () async {
    final state = EggBloomState.withRepositories(
      userRepository: _FailingUserRepository(),
      collectionRepository: _EmptyCollectionRepository(),
      flowerRepository: _FlowerRepository(),
      orderRepository: _OrderRepository(),
      programRepository: _ProgramRepository(program),
      reservationRepository: _ReservationRepository(),
      shopRepository: _ShopRepository(),
      autoLoad: false,
    );

    await state.loadInitialData();

    expect(state.shops, hasLength(1));
    expect(state.flowers, hasLength(1));
    expect(state.programs.single.title, '꽃다발 만들기');
    expect(state.programs.single.location, '서면 온실');
    expect(state.errorMessage, contains('사용자 정보'));
  });

  test('예약 내역을 프로그램 상세와 결합하고 취소 상태를 반영한다', () async {
    final reservations = _ReservationRepository(
      initial: [
        Program.fromReservationJson({
          'id': 91,
          'program_id': 7,
          'status': 'reserved',
          'total_amount': 30000,
        }),
      ],
    );
    final state = EggBloomState.withRepositories(
      userRepository: _UserRepository(),
      collectionRepository: _EmptyCollectionRepository(),
      flowerRepository: _FlowerRepository(),
      orderRepository: _OrderRepository(),
      programRepository: _ProgramRepository(program),
      reservationRepository: reservations,
      shopRepository: _ShopRepository(),
      autoLoad: false,
    );

    await state.loadInitialData();
    expect(state.reservations.single.title, '꽃다발 만들기');
    expect(state.reservations.single.reservationId, 91);

    await state.cancelReservation(state.reservations.single);
    expect(reservations.cancelledId, 91);
    expect(state.reservations.single.reservationStatus, 'cancelled');
  });

  test('수거 장소 메모와 가격을 사용자 표시 형식으로 변환한다', () {
    final collection = CollectionRecord.fromContributionJson({
      'created_at': '2026-08-27T10:00:00',
      'weight_kg': '0.120',
      'status': 'pending',
      'memo': '[수거 장소] 부산대 제휴 수거함\n깨끗이 세척함',
    });
    final flower = Flower.fromJson({
      'id': 1,
      'shop_id': 3,
      'name': '레드 장미',
      'description': '선명한 빨간 장미',
      'price': 4200.0,
      'color': '레드',
      'stock_quantity': 5,
    });
    final user = UserSummary.fromJson({
      'id': 1,
      'email': 'user@example.com',
      'full_name': null,
      'accumulated_eggshell_kg': '0.320',
      'saved_co2_kg': '0.1180',
      'reward_points': 32,
      'contribution_count': 3,
      'pending_contribution_count': 1,
    });

    expect(collection.location, '부산대 제휴 수거함');
    expect(collection.memo, '깨끗이 세척함');
    expect(flower.price, '4,200원');
    expect(flower.emoji, '🌹');
    expect(flower.description, '선명한 빨간 장미');
    expect(user.accumulatedEggshellGrams, 320);
    expect(user.fullName, '사용자');
  });

  test('기존 주문을 불러오고 새 주문을 목록 맨 앞에 추가한다', () async {
    final orderRepository = _OrderRepository(
      initial: [_order(id: 12, totalAmount: 4200)],
    );
    final state = EggBloomState.withRepositories(
      userRepository: _UserRepository(),
      collectionRepository: _EmptyCollectionRepository(),
      flowerRepository: _FlowerRepository(),
      orderRepository: orderRepository,
      programRepository: _ProgramRepository(program),
      reservationRepository: _ReservationRepository(),
      shopRepository: _ShopRepository(),
      autoLoad: false,
    );

    await state.loadInitialData();
    expect(state.orders.single.id, 12);

    await state.requestFlowerOrderItems(const [
      OrderItemRequest(flowerId: 1, quantity: 2),
    ]);

    expect(orderRepository.createdItems.single.quantity, 2);
    expect(state.orders.first.id, 99);
    expect(state.orders, hasLength(2));
  });
}

OrderRecord _order({required int id, required int totalAmount}) {
  return OrderRecord(
    id: id,
    totalAmount: totalAmount,
    status: 'paid',
    createdAt: DateTime(2026, 8, 27, 13, 30),
    items: [
      OrderLine(
        flowerId: 1,
        quantity: 1,
        unitPrice: totalAmount,
        lineAmount: totalAmount,
      ),
    ],
  );
}

class _FailingUserRepository implements UserRepository {
  @override
  Future<UserSummary> fetchMe() => Future.error(Exception('user failed'));
}

class _UserRepository implements UserRepository {
  @override
  Future<UserSummary> fetchMe() async => const UserSummary(
    id: 1,
    email: 'user@example.com',
    fullName: '사용자',
    accumulatedEggshellKg: 0,
    savedCo2Kg: 0,
    rewardPoints: 0,
    contributionCount: 0,
    pendingContributionCount: 0,
  );
}

class _EmptyCollectionRepository implements CollectionRepository {
  @override
  Future<List<CollectionRecord>> fetchMyCollections() async => const [];

  @override
  Future<CollectionRecord> submitCollection({
    required String location,
    required int grams,
    required String memo,
    String? imageUrl,
  }) async => CollectionRecord(
    date: '오늘',
    location: location,
    grams: grams,
    memo: memo,
  );
}

class _FlowerRepository implements FlowerRepository {
  @override
  Future<List<Flower>> fetchFlowers({int? shopId}) async => const [
    Flower(
      id: 1,
      shopId: 3,
      name: '장미',
      price: '4,200원',
      location: '서면 온실',
      description: '',
      emoji: '🌹',
      stock: 5,
      bgColor: Colors.pink,
    ),
  ];
}

class _OrderRepository implements OrderRepository {
  _OrderRepository({this.initial = const []});

  final List<OrderRecord> initial;
  List<OrderItemRequest> createdItems = [];

  @override
  Future<List<OrderRecord>> fetchMyOrders() async => initial;

  @override
  Future<OrderRecord> createOrder({
    required List<OrderItemRequest> items,
  }) async {
    createdItems = items;
    return _order(id: 99, totalAmount: 8400);
  }
}

class _ProgramRepository implements ProgramRepository {
  _ProgramRepository(this.program);

  final Program program;

  @override
  Future<List<Program>> fetchPrograms() async => [program];
}

class _ReservationRepository implements ReservationRepository {
  _ReservationRepository({this.initial = const []});

  final List<Program> initial;
  int? cancelledId;

  @override
  Future<void> cancelReservation({required int reservationId}) async {
    cancelledId = reservationId;
  }

  @override
  Future<Program> createReservation({
    required int programId,
    int participantCount = 1,
  }) async => Program.fromReservationJson({
    'id': 99,
    'program_id': programId,
    'status': 'reserved',
    'total_amount': 30000,
  });

  @override
  Future<List<Program>> fetchMyReservations() async => initial;
}

class _ShopRepository implements ShopRepository {
  @override
  Future<List<Shop>> fetchShops() async => const [
    Shop(
      id: 3,
      name: '서면 온실',
      region: '부산 부산진구',
      address: '부산 부산진구',
      phone: '',
      description: '',
      averageRating: 4.8,
      reviewCount: 10,
    ),
  ];
}
