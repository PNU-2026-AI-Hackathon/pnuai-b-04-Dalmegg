import '../core/api_client.dart';
import '../models/program.dart';

abstract class ReservationRepository {
  Future<List<Program>> fetchMyReservations();
  Future<Program> createReservation({
    required int programId,
    int participantCount = 1,
  });
  Future<void> cancelReservation({required int reservationId});
}

class MockReservationRepository implements ReservationRepository {
  const MockReservationRepository();

  @override
  Future<List<Program>> fetchMyReservations() async => const [];

  @override
  Future<Program> createReservation({
    required int programId,
    int participantCount = 1,
  }) async {
    return Program.fromReservationJson({
      'id': programId,
      'program_id': programId,
      'status': 'reserved',
      'total_amount': 0,
    });
  }

  @override
  Future<void> cancelReservation({required int reservationId}) async {}
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
  Future<Program> createReservation({
    required int programId,
    int participantCount = 1,
  }) async {
    final json = await apiClient.postJson(
      '/api/reservations',
      body: {'program_id': programId, 'participant_count': participantCount},
    );
    return Program.fromReservationJson(json);
  }

  @override
  Future<void> cancelReservation({required int reservationId}) async {
    await apiClient.patchJson('/api/reservations/$reservationId/cancel');
  }
}
