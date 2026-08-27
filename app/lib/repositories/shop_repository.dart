import '../core/api_client.dart';
import '../models/shop.dart';

abstract class ShopRepository {
  Future<List<Shop>> fetchShops();
}

class MockShopRepository implements ShopRepository {
  const MockShopRepository();

  @override
  Future<List<Shop>> fetchShops() async {
    return const [
      Shop(
        id: 1,
        name: '도화농장 플라워',
        region: '부산',
        address: '부산광역시 금정구 장전동',
        phone: '010-1234-5678',
        description: '계란껍질 비료로 재배한 계절 꽃을 판매하는 제휴 농장입니다.',
        averageRating: 4.8,
        reviewCount: 24,
      ),
      Shop(
        id: 2,
        name: '부산대 스마트팜',
        region: '부산',
        address: '부산광역시 금정구 부산대학로',
        phone: '010-9876-5432',
        description: '스마트팜 재배 환경에서 친환경 꽃과 체험 프로그램을 운영합니다.',
        averageRating: 4.6,
        reviewCount: 18,
      ),
      Shop(
        id: 3,
        name: '장전동 그린 플라워',
        region: '부산',
        address: '부산광역시 금정구 장전로',
        phone: '010-0000-1122',
        description: '지역 제휴 카페와 함께 꽃 픽업 서비스를 제공하는 동네 꽃집입니다.',
        averageRating: 4.4,
        reviewCount: 9,
      ),
    ];
  }
}

class ApiShopRepository implements ShopRepository {
  const ApiShopRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<List<Shop>> fetchShops() async {
    final list = await apiClient.getList('/api/shops?region=부산');
    return list.whereType<Map<String, dynamic>>().map(Shop.fromJson).toList();
  }
}
