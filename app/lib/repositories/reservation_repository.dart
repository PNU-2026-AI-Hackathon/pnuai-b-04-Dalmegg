import '../core/api_client.dart';
import '../models/program.dart';

abstract class ReservationRepository {
  Future<List<Program>> fetchMyReservations();
  Future<void> createReservation({
    required int programId,
    int participantCount = 1,
  });
}

class MockReservationRepository implements ReservationRepository {
  const MockReservationRepository();

  @override
  Future<List<Program>> fetchMyReservations() async => const [];

  @override
  Future<void> createReservation({
    required int programId,
    int participantCount = 1,
  }) async {}
}

class ApiReservationRepository implements ReservationRepository {
  const ApiReservationRepository({required this.apiClient});

  final ApiClient apiClient;

  @override
  Future<List<Program>> fetchMyReservations() async {
    final list = await apiClient.getList('/api/reservations');
    return list
        .whereType<Map<String, dynamic>>()
        .map(Program.fromReservationJson)
        .toList();
  }

  @override
  Future<void> createReservation({
    required int programId,
    int participantCount = 1,
  }) async {
    await apiClient.postJson(
      '/api/reservations',
      body: {'program_id': programId, 'participant_count': participantCount},
    );
  }
}
