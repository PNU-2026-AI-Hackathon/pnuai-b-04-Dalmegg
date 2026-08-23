import 'package:flutter/material.dart';

import '../models/collection_record.dart';
import '../models/flower.dart';
import '../models/program.dart';
import '../models/user_profile.dart';
import '../services/api_client.dart';

class EggBloomState extends ChangeNotifier {
  EggBloomState({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  static const int rewardGoalGrams = 500;

  final ApiClient _api;
  UserProfile? profile;
  bool isGuest = false;
  bool isBusy = false;
  bool isOfflineDemo = false;
  String? lastError;

  bool get isAuthenticated => _api.isAuthenticated;
  String get userName => profile?.fullName?.trim().isNotEmpty == true
      ? profile!.fullName!
      : isGuest
          ? '게스트'
          : '순환러';
  String get userEmail => profile?.email ?? '';
  int get totalGrams => profile == null
      ? _demoTotalGrams
      : (profile!.accumulatedEggshellKg * 1000).round();
  int get rewardPoints => profile?.rewardPoints ?? 0;
  double get savedCo2Kg => profile?.savedCo2Kg ?? 0;
  int get contributionCount =>
      profile?.contributionCount ?? collectionRecords.length;
  int get pendingContributionCount => profile?.pendingContributionCount ?? 0;

  List<CollectionRecord> collectionRecords = List.of(_demoCollectionRecords);
  List<Flower> flowers = List.of(_demoFlowers);
  List<Program> programs = List.of(_demoPrograms);
  List<Program> reservations = [];

  int get remainingGrams {
    final remaining = rewardGoalGrams - totalGrams;
    return remaining > 0 ? remaining : 0;
  }

  bool get rewardReady => totalGrams >= rewardGoalGrams;

  Future<void> initialize() async {
    await loadCatalog();
  }

  void continueAsGuest() {
    isGuest = true;
    lastError = null;
    notifyListeners();
  }

  void showLogin() {
    isGuest = false;
    lastError = null;
    notifyListeners();
  }

  Future<bool> login({required String email, required String password}) async {
    return _runAuth(() => _api.login(email: email, password: password));
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    return _runAuth(
      () => _api.register(
        email: email,
        password: password,
        fullName: fullName,
      ),
    );
  }

  Future<bool> _runAuth(Future<void> Function() action) async {
    isBusy = true;
    lastError = null;
    notifyListeners();
    try {
      await action();
      isGuest = false;
      try {
        await refreshPrivateData();
        isOfflineDemo = false;
      } on ApiException catch (error) {
        isOfflineDemo = true;
        lastError = _friendlyError(error);
      }
      return true;
    } on ApiException catch (error) {
      lastError = _friendlyError(error);
      return false;
    } finally {
      isBusy = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    isBusy = true;
    notifyListeners();
    try {
      await _api.logout();
    } finally {
      profile = null;
      reservations = [];
      collectionRecords = List.of(_demoCollectionRecords);
      isGuest = false;
      isBusy = false;
      notifyListeners();
    }
  }

  Future<void> loadCatalog() async {
    try {
      final results = await Future.wait([
        _api.listFlowers(),
        _api.listPrograms(),
      ]);
      final liveFlowers = results[0] as List<Flower>;
      final livePrograms = results[1] as List<Program>;
      flowers = liveFlowers;
      programs = livePrograms;
      isOfflineDemo = false;
      lastError = null;
    } on ApiException catch (error) {
      isOfflineDemo = true;
      lastError = _friendlyError(error);
    }
    notifyListeners();
  }

  Future<void> refreshPrivateData() async {
    _requireAuthentication();
    final results = await Future.wait([
      _api.getMyProfile(),
      _api.listContributions(),
      _api.listReservationProgramIds(),
    ]);
    profile = results[0] as UserProfile;
    collectionRecords = results[1] as List<CollectionRecord>;
    final reservedIds = (results[2] as List<int>).toSet();
    reservations = programs
        .where((program) => reservedIds.contains(program.id))
        .toList(growable: false);
    lastError = null;
    notifyListeners();
  }

  Future<void> addCollection({
    required String location,
    required int grams,
    String? memo,
  }) async {
    _requireAuthentication();
    final record = await _api.submitCollection(
      location: location,
      grams: grams,
      memo: memo,
    );
    collectionRecords.insert(0, record);
    if (profile != null) {
      profile = UserProfile(
        id: profile!.id,
        email: profile!.email,
        fullName: profile!.fullName,
        accumulatedEggshellKg: profile!.accumulatedEggshellKg,
        savedCo2Kg: profile!.savedCo2Kg,
        rewardPoints: profile!.rewardPoints,
        contributionCount: profile!.contributionCount,
        pendingContributionCount: profile!.pendingContributionCount + 1,
      );
    }
    notifyListeners();
  }

  Future<void> reserveProgram(Program program) async {
    _requireAuthentication();
    if (program.id <= 0) {
      throw const ApiException('데모 체험은 예약할 수 없습니다. 서버 연결을 확인해주세요.');
    }
    if (reservations.any((item) => item.id == program.id)) return;
    await _api.reserveProgram(program.id);
    reservations.insert(0, program);
    notifyListeners();
  }

  Future<void> orderFlower(Flower flower) async {
    _requireAuthentication();
    if (flower.id <= 0) {
      throw const ApiException('데모 상품은 주문할 수 없습니다. 서버 연결을 확인해주세요.');
    }
    if (flower.stock <= 0) {
      throw const ApiException('현재 품절된 꽃입니다.');
    }
    await _api.orderFlower(flower.id);
    await loadCatalog();
  }

  void _requireAuthentication() {
    if (!isAuthenticated) {
      throw const ApiException('로그인 후 이용할 수 있습니다.');
    }
  }

  String _friendlyError(ApiException error) {
    if (error.statusCode == 401) return '이메일 또는 비밀번호를 확인해주세요.';
    if (error.statusCode == 409) return '이미 처리되었거나 재고·좌석이 부족합니다.';
    if (error.statusCode == 422) return '입력 내용을 다시 확인해주세요.';
    return error.message;
  }

  static const int _demoTotalGrams = 320;

  static const _demoCollectionRecords = [
    CollectionRecord(date: '07.01', location: '부산대 제휴 수거함', grams: 85),
    CollectionRecord(date: '06.27', location: '장전동 제휴 카페', grams: 120),
    CollectionRecord(date: '06.22', location: '도화농장 수거함', grams: 115),
  ];

  static const _demoFlowers = [
    Flower(
      name: '미니 거베라',
      price: '5,200원',
      stock: 14,
      location: '도화농장',
      description: '선명한 색감의 소형 거베라. 화분에 넣어 선물하기 좋아요.',
      emoji: '🌸',
      bgColor: Color(0xFFFCE4EC),
    ),
    Flower(
      name: '봄 튤립',
      price: '6,800원',
      stock: 8,
      location: '도화농장',
      description: '부드러운 파스텔 핑크. 이번 주 한정 수확분이에요.',
      emoji: '🌷',
      bgColor: Color(0xFFFCE4F0),
    ),
    Flower(
      name: '프리미엄 장미',
      price: '8,500원',
      stock: 5,
      location: '부산대 스마트팜',
      description: 'ESG 친환경 인증 재배. 계란껍질 비료로 키웠어요.',
      emoji: '🌹',
      bgColor: Color(0xFFFFEBEE),
    ),
  ];

  static const _demoPrograms = [
    Program(
      title: 'ESG 꽃꾸 클래스',
      date: '2026년 7월 12일 (일) 14:00',
      location: '부산대 그린스페이스',
      price: '15,000원',
      remainingSpots: 3,
      totalSpots: 12,
      description: '친환경 꽃꾸미기와 ESG 스마트팜 견학을 함께 경험해요.',
      tag: '인기',
      tagColor: Colors.pinkAccent,
    ),
    Program(
      title: '업사이클링 플라워 클래스',
      date: '2026년 7월 19일 (일) 13:00',
      location: '장전동 제휴 스튜디오',
      price: '18,000원',
      remainingSpots: 6,
      totalSpots: 10,
      description: '계란껍질 화분 만들기와 화훼 장식 체험을 진행해요.',
      tag: 'NEW',
      tagColor: Colors.green,
    ),
  ];
}
