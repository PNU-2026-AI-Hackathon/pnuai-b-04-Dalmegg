import 'package:flutter/material.dart';

import '../models/collection_record.dart';
import '../models/flower.dart';
import '../models/program.dart';
import '../repositories/collection_repository.dart';
import '../repositories/flower_repository.dart';
import '../repositories/order_repository.dart';
import '../repositories/program_repository.dart';
import '../repositories/reservation_repository.dart';
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
      );

  EggBloomState.withRepositories({
    required UserRepository userRepository,
    required CollectionRepository collectionRepository,
    required FlowerRepository flowerRepository,
    required OrderRepository orderRepository,
    required ProgramRepository programRepository,
    required ReservationRepository reservationRepository,
  }) : this._internal(
         userRepository,
         collectionRepository,
         flowerRepository,
         orderRepository,
         programRepository,
         reservationRepository,
       );

  EggBloomState._internal(
    this._userRepository,
    this._collectionRepository,
    this._flowerRepository,
    this._orderRepository,
    this._programRepository,
    this._reservationRepository,
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

  int get remainingGrams {
    final remaining = rewardGoalGrams - totalGrams;
    return remaining > 0 ? remaining : 0;
  }

  bool get rewardReady => totalGrams >= rewardGoalGrams;

  Future<void> loadInitialData() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _userRepository.fetchMe(),
        _collectionRepository.fetchMyCollections(),
        _flowerRepository.fetchFlowers(),
        _programRepository.fetchPrograms(),
        _reservationRepository.fetchMyReservations(),
      ]);

      final user = results[0] as UserSummary;
      userName = user.fullName;
      totalGrams = user.accumulatedEggshellGrams;
      savedCo2Kg = user.savedCo2Kg;
      rewardPoints = user.rewardPoints;
      contributionCount = user.contributionCount;
      pendingContributionCount = user.pendingContributionCount;

      collectionRecords
        ..clear()
        ..addAll(results[1] as List<CollectionRecord>);
      flowers
        ..clear()
        ..addAll(results[2] as List<Flower>);
      programs
        ..clear()
        ..addAll(results[3] as List<Program>);
      reservations
        ..clear()
        ..addAll(results[4] as List<Program>);
    } catch (_) {
      errorMessage = '데이터를 불러오지 못했습니다.';
    } finally {
      isLoading = false;
      notifyListeners();
    }
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

  Future<void> requestFlowerOrder(Flower flower) async {
    await _orderRepository.createOrder(flowerId: flower.id);
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
