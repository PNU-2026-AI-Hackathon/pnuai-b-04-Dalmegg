import 'package:flutter/material.dart';

import '../models/collection_record.dart';
import '../models/flower.dart';
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
  EggBloomState()
    : this._internal(
        const MockUserRepository(),
        const MockCollectionRepository(),
        const MockFlowerRepository(),
        const MockOrderRepository(),
        const MockProgramRepository(),
        const MockReservationRepository(),
        const MockShopRepository(),
      );

  EggBloomState.withRepositories({
    required UserRepository userRepository,
    required CollectionRepository collectionRepository,
    required FlowerRepository flowerRepository,
    required OrderRepository orderRepository,
    required ProgramRepository programRepository,
    required ReservationRepository reservationRepository,
    required ShopRepository shopRepository,
  }) : this._internal(
         userRepository,
         collectionRepository,
         flowerRepository,
         orderRepository,
         programRepository,
         reservationRepository,
         shopRepository,
       );

  EggBloomState._internal(
    this._userRepository,
    this._collectionRepository,
    this._flowerRepository,
    this._orderRepository,
    this._programRepository,
    this._reservationRepository,
    this._shopRepository,
  ) {
    loadInitialData();
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
  final List<Program> programs = [];
  final List<Shop> shops = [];

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
        debugPrint('$label 로딩 실패: $error');
        debugPrintStack(stackTrace: stackTrace);
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

  Future<void> requestFlowerOrder(
    Flower flower, {
    required int quantity,
  }) async {
    await requestFlowerOrderItems([
      OrderItemRequest(flowerId: flower.id, quantity: quantity),
    ]);
  }

  Future<void> requestFlowerOrderItems(List<OrderItemRequest> items) async {
    if (items.isEmpty) {
      return;
    }
    await _orderRepository.createOrder(items: items);
  }

  Future<List<Flower>> fetchFlowersByShop(int shopId) {
    return _flowerRepository.fetchFlowers(shopId: shopId);
  }

  Future<void> reserveProgram(Program program) async {
    if (reservations.any((item) => item.id == program.id)) {
      return;
    }
    await _reservationRepository.createReservation(programId: program.id);
    reservations.insert(0, program);
    notifyListeners();
  }
}
