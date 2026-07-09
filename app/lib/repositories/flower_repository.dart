import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../models/flower.dart';

abstract class FlowerRepository {
  Future<List<Flower>> fetchFlowers();
}

class MockFlowerRepository implements FlowerRepository {
  const MockFlowerRepository();

  @override
  Future<List<Flower>> fetchFlowers() async {
    return const [
      Flower(
        id: 1,
        name: '미니 거베라',
        price: '5,200원',
        stock: 14,
        location: '도화농장',
        description: '선명한 색감의 소형 거베라. 화분에 넣어 선물하기 좋아요.',
        emoji: '🌸',
        bgColor: Color(0xFFFCE4EC),
      ),
      Flower(
        id: 2,
        name: '봄 튤립',
        price: '6,800원',
        stock: 8,
        location: '도화농장',
        description: '부드러운 파스텔 핑크. 이번 주 한정 수확분이에요.',
        emoji: '🌷',
        bgColor: Color(0xFFFCE4F0),
      ),
      Flower(
        id: 3,
        name: '프리미엄 장미',
        price: '8,500원',
        stock: 5,
        location: '부산대 스마트팜',
        description: 'ESG 친환경 인증 재배. 계란껍질 비료로 키웠어요.',
        emoji: '🌹',
        bgColor: Color(0xFFFFEBEE),
      ),
      Flower(
        id: 4,
        name: '프리지아',
        price: '4,500원',
        stock: 20,
        location: '부산대 스마트팜',
        description: '은은한 향이 일품. 봄 내음을 그대로 담았어요.',
        emoji: '🌼',
        bgColor: Color(0xFFFFFDE7),
      ),
    ];
  }
}

class ApiFlowerRepository implements FlowerRepository {
  const ApiFlowerRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<List<Flower>> fetchFlowers() async {
    final list = await apiClient.getList('/api/flowers');
    return list.whereType<Map<String, dynamic>>().map(Flower.fromJson).toList();
  }
}
