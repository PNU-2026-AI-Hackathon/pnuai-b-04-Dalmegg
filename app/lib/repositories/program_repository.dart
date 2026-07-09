import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../models/program.dart';

abstract class ProgramRepository {
  Future<List<Program>> fetchPrograms();
}

class MockProgramRepository implements ProgramRepository {
  const MockProgramRepository();

  @override
  Future<List<Program>> fetchPrograms() async {
    return const [
      Program(
        id: 1,
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
        id: 2,
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
      Program(
        id: 3,
        title: '나만의 미니 꽃다발 만들기',
        date: '2026년 7월 26일 (일) 15:00',
        location: '도화농장 체험동',
        price: '12,000원',
        remainingSpots: 8,
        totalSpots: 15,
        description: '직접 수확한 꽃으로 나만의 꽃다발을 완성해요.',
        tag: '추천',
        tagColor: Colors.amber,
      ),
    ];
  }
}

class ApiProgramRepository implements ProgramRepository {
  const ApiProgramRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<List<Program>> fetchPrograms() async {
    final list = await apiClient.getList('/api/programs');
    return list
        .whereType<Map<String, dynamic>>()
        .map(Program.fromJson)
        .toList();
  }
}
