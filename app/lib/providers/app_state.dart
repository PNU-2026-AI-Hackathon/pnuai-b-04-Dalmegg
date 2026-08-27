import 'package:flutter/material.dart';

import '../models/collection_record.dart';
import '../models/flower.dart';
import '../models/order_record.dart';
import '../models/program.dart';
import '../models/shop.dart';
import '../repositories/collection_repository.dart';
import '../repositories/flower_repository.dart';
import '../repositories/order_repository.dart';
import '../repositories/program_repository.dart';
import '../repositories/reservation_repository.dart';
import '../repositories/shop_repository.dart';
import '../repositories/user_repository.dart';

class EggBloomState extends ChangeNotifier {
  EggBloomState({bool autoLoad = true})
    : this._internal(
        const MockUserRepository(),
        const MockCollectionRepository(),
        const MockFlowerRepository(),
        const MockOrderRepository(),
        const MockProgramRepository(),
        const MockReservationRepository(),
        const MockShopRepository(),
        autoLoad,
      );

  EggBloomState.withRepositories({
    required UserRepository userRepository,
    required CollectionRepository collectionRepository,
    required FlowerRepository flowerRepository,
    required OrderRepository orderRepository,
    required ProgramRepository programRepository,
    required ReservationRepository reservationRepository,
    required ShopRepository shopRepository,
    bool autoLoad = true,
  }) : this._internal(
         userRepository,
         collectionRepository,
         flowerRepository,
         orderRepository,
         programRepository,
         reservationRepository,
         shopRepository,
         autoLoad,
       );

  EggBloomState._internal(
    this._userRepository,
    this._collectionRepository,
    this._flowerRepository,
    this._orderRepository,
    this._programRepository,
    this._reservationRepository,
    this._shopRepository,
    bool autoLoad,
  ) {
    if (autoLoad) {
      loadInitialData();
    }
  }

  static const int rewardGoalGrams = 500;

  final UserRepository _userRepository;
  final CollectionRepository _collectionRepository;
  final FlowerRepository _flowerRepository;
  final OrderRepository _orderRepository;
  final ProgramRepository _programRepository;
  final ReservationRepository _reservationRepository;
  final ShopRepository _shopRepository;

  String userName = '김순환';
  int totalGrams = 0;
  double savedCo2Kg = 0;
  int rewardPoints = 0;
  int contributionCount = 0;
  int pendingContributionCount = 0;
  bool isLoading = false;
  String? errorMessage;

  final List<CollectionRecord> collectionRecords = [];
  final List<Program> reservations = [];
  final List<Flower> flowers = [];
  final List<OrderRecord> orders = [];
  final List<Program> programs = [];
  final List<Shop> shops = [];
  final Set<int> _reservingProgramIds = {};
  final Set<int> _cancellingReservationIds = {};

  bool isReservingProgram(int programId) =>
      _reservingProgramIds.contains(programId);

  bool isCancellingReservation(int reservationId) =>
      _cancellingReservationIds.contains(reservationId);

  int get remainingGrams {
    final remaining = rewardGoalGrams - totalGrams;
    return remaining > 0 ? remaining : 0;
  }

  bool get rewardReady => totalGrams >= rewardGoalGrams;

  Future<void> loadInitialData() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    final failedLoads = <String>[];

    Future<void> load(String label, Future<void> Function() request) async {
      try {
        await request();
      } catch (error, stackTrace) {
        failedLoads.add(label);
        debugPrint('$label 로딩 실패: $error\n$stackTrace');
      }
    }

    await Future.wait([
      load('사용자 정보', () async {
        final user = await _userRepository.fetchMe();
        userName = user.fullName;
        totalGrams = user.accumulatedEggshellGrams;
        savedCo2Kg = user.savedCo2Kg;
        rewardPoints = user.rewardPoints;
        contributionCount = user.contributionCount;
        pendingContributionCount = user.pendingContributionCount;
      }),
      load('수거 내역', () async {
        final records = await _collectionRepository.fetchMyCollections();
        collectionRecords
          ..clear()
          ..addAll(records);
      }),
      load('꽃 상품', () async {
        final loadedFlowers = await _flowerRepository.fetchFlowers();
        flowers
          ..clear()
          ..addAll(loadedFlowers);
      }),
      load('주문 내역', () async {
        final loadedOrders = await _orderRepository.fetchMyOrders();
        orders
          ..clear()
          ..addAll(loadedOrders);
      }),
      load('체험 프로그램', () async {
        final loadedPrograms = await _programRepository.fetchPrograms();
        programs
          ..clear()
          ..addAll(loadedPrograms);
      }),
      load('예약 내역', () async {
        final loadedReservations = await _reservationRepository
            .fetchMyReservations();
        reservations
          ..clear()
          ..addAll(loadedReservations);
      }),
      load('꽃집', () async {
        final loadedShops = await _shopRepository.fetchShops();
        shops
          ..clear()
          ..addAll(loadedShops);
      }),
    ]);

    _hydrateProgramLocations();
    _hydrateReservations();

    if (failedLoads.isNotEmpty) {
      errorMessage = '일부 데이터를 불러오지 못했습니다: ${failedLoads.join(', ')}';
    }
    isLoading = false;
    notifyListeners();
  }

  Future<void> addCollection({
    required String location,
    required int grams,
    required String memo,
  }) async {
    final record = await _collectionRepository.submitCollection(
      location: location,
      grams: grams,
      memo: memo,
    );
    collectionRecords.insert(
      0,
      CollectionRecord(
        date: record.date,
        location: location,
        grams: record.grams,
        status: record.status,
        memo: record.memo,
        imageUrl: record.imageUrl,
      ),
    );
    pendingContributionCount += 1;
    notifyListeners();
  }

  Future<OrderRecord> requestFlowerOrder(
    Flower flower, {
    required int quantity,
  }) {
    return requestFlowerOrderItems([
      OrderItemRequest(flowerId: flower.id, quantity: quantity),
    ]);
  }

  Future<OrderRecord> requestFlowerOrderItems(
    List<OrderItemRequest> items,
  ) async {
    if (items.isEmpty) {
      throw ArgumentError.value(items, 'items', '주문 상품이 필요합니다.');
    }
    final order = await _orderRepository.createOrder(items: items);
    orders.insert(0, order);
    notifyListeners();
    return order;
  }

  Future<List<Flower>> fetchFlowersByShop(int shopId) {
    return _flowerRepository.fetchFlowers(shopId: shopId);
  }

  Future<void> reserveProgram(Program program) async {
    if (reservations.any(
          (item) =>
              item.id == program.id && item.reservationStatus != 'cancelled',
        ) ||
        _reservingProgramIds.contains(program.id)) {
      return;
    }
    _reservingProgramIds.add(program.id);
    notifyListeners();
    try {
      final reservation = await _reservationRepository.createReservation(
        programId: program.id,
      );
      reservations.insert(0, reservation.withProgramDetails(program));
    } finally {
      _reservingProgramIds.remove(program.id);
      notifyListeners();
    }
  }

  Future<void> cancelReservation(Program reservation) async {
    final reservationId = reservation.reservationId;
    if (reservationId == null ||
        _cancellingReservationIds.contains(reservationId)) {
      return;
    }
    _cancellingReservationIds.add(reservationId);
    notifyListeners();
    try {
      await _reservationRepository.cancelReservation(
        reservationId: reservationId,
      );
      final index = reservations.indexWhere(
        (item) => item.reservationId == reservationId,
      );
      if (index >= 0) {
        reservations[index] = reservations[index].withReservationStatus(
          'cancelled',
        );
      }
    } finally {
      _cancellingReservationIds.remove(reservationId);
      notifyListeners();
    }
  }

  void _hydrateReservations() {
    final programsById = {for (final program in programs) program.id: program};
    for (var index = 0; index < reservations.length; index += 1) {
      final details = programsById[reservations[index].id];
      if (details != null) {
        reservations[index] = reservations[index].withProgramDetails(details);
      }
    }
  }

  void _hydrateProgramLocations() {
    final shopsById = {for (final shop in shops) shop.id: shop};
    for (var index = 0; index < programs.length; index += 1) {
      final shop = shopsById[programs[index].shopId];
      if (shop != null) {
        programs[index] = programs[index].withLocation(shop.name);
      }
    }
  }
}
