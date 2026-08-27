import '../core/api_client.dart';
import '../models/collection_record.dart';

abstract class CollectionRepository {
  Future<List<CollectionRecord>> fetchMyCollections();
  Future<CollectionRecord> submitCollection({
    required String location,
    required int grams,
    required String memo,
    String? imageUrl,
  });
}

class MockCollectionRepository implements CollectionRepository {
  const MockCollectionRepository();

  @override
  Future<List<CollectionRecord>> fetchMyCollections() async {
    return const [
      CollectionRecord(
        date: '07.01',
        location: '부산대 제휴 수거함',
        grams: 85,
        status: CollectionStatus.approved,
      ),
      CollectionRecord(
        date: '06.27',
        location: '장전동 제휴 카페',
        grams: 120,
        status: CollectionStatus.approved,
      ),
      CollectionRecord(
        date: '06.22',
        location: '도화농장 수거함',
        grams: 115,
        status: CollectionStatus.approved,
      ),
    ];
  }

  @override
  Future<CollectionRecord> submitCollection({
    required String location,
    required int grams,
    required String memo,
    String? imageUrl,
  }) async {
    return CollectionRecord(
      date: '오늘',
      location: location,
      grams: grams,
      status: CollectionStatus.pending,
      memo: memo,
      imageUrl: imageUrl,
    );
  }
}

class ApiCollectionRepository implements CollectionRepository {
  const ApiCollectionRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<List<CollectionRecord>> fetchMyCollections() async {
    final list = await apiClient.getList(
      '/api/eco/contributions?offset=0&limit=20',
    );
    return list
        .whereType<Map<String, dynamic>>()
        .map(CollectionRecord.fromContributionJson)
        .toList();
  }

  @override
  Future<CollectionRecord> submitCollection({
    required String location,
    required int grams,
    required String memo,
    String? imageUrl,
  }) async {
    final locationLine = '[수거 장소] $location';
    final storedMemo = memo.isEmpty ? locationLine : '$locationLine\n$memo';
    final json = await apiClient.postJson(
      '/api/collections',
      body: {
        'weight_kg': grams / 1000,
        'memo': storedMemo,
        'image_url': imageUrl,
      },
    );
    return CollectionRecord.fromContributionJson(json);
  }
}
