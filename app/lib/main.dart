import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/api_client.dart';
import 'core/token_storage.dart';
import 'features/market/market_detail_screen.dart';
import 'features/market/market_list_screen.dart';
import 'providers/app_state.dart';
import 'providers/auth_session.dart';
import 'repositories/auth_repository.dart';
import 'repositories/collection_repository.dart';
import 'repositories/flower_repository.dart';
import 'repositories/order_repository.dart';
import 'repositories/program_repository.dart';
import 'repositories/reservation_repository.dart';
import 'repositories/shop_repository.dart';
import 'repositories/user_repository.dart';
import 'screens/collect/collect_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/experience/experience_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/my/my_screen.dart';
import 'theme/app_theme.dart';
import 'widgets/bottom_nav_bar.dart';

void main() => runApp(const EggBloomApp());

class EggBloomApp extends StatelessWidget {
  const EggBloomApp({super.key, this.useMockRepositories = false});

  final bool useMockRepositories;

  static const _apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8000',
  );
  static const _accessToken = String.fromEnvironment('ACCESS_TOKEN');
  static const _refreshToken = String.fromEnvironment('REFRESH_TOKEN');

  static final _router = GoRouter(
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) {
          final tab = int.tryParse(state.uri.queryParameters['tab'] ?? '') ?? 0;
          return AuthGate(initialIndex: tab);
        },
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/market/:id',
        builder: (context, state) {
          final marketId = state.pathParameters['id'] ?? '';
          return MarketDetailScreen(marketId: marketId);
        },
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    final dependencies = _createApiDependencies();

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthSession(
            authRepository: useMockRepositories
                ? _MockAuthRepository()
                : ApiAuthRepository(
                    apiClient: dependencies.apiClient,
                    tokenStorage: dependencies.tokenStorage,
                  ),
            isAuthenticated: useMockRepositories || _accessToken.isNotEmpty,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => useMockRepositories
              ? EggBloomState()
              : _createApiState(dependencies.apiClient),
        ),
      ],
      child: MaterialApp.router(
        title: 'Egg Bloom',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: _router,
      ),
    );
  }

  _ApiDependencies _createApiDependencies() {
    final tokenStorage = MemoryTokenStorage(
      accessToken: _accessToken.isEmpty ? null : _accessToken,
      refreshToken: _refreshToken.isEmpty ? null : _refreshToken,
    );
    final apiClient = ApiClient(
      baseUrl: Uri.parse(_apiBaseUrl),
      tokenStorage: tokenStorage,
    );

    return _ApiDependencies(apiClient: apiClient, tokenStorage: tokenStorage);
  }

  EggBloomState _createApiState(ApiClient apiClient) {
    return EggBloomState.withRepositories(
      userRepository: ApiUserRepository(apiClient: apiClient),
      collectionRepository: ApiCollectionRepository(apiClient: apiClient),
      flowerRepository: ApiFlowerRepository(apiClient: apiClient),
      orderRepository: ApiOrderRepository(apiClient: apiClient),
      programRepository: ApiProgramRepository(apiClient: apiClient),
      reservationRepository: ApiReservationRepository(apiClient: apiClient),
      shopRepository: ApiShopRepository(apiClient: apiClient),
    );
  }
}

class _ApiDependencies {
  const _ApiDependencies({required this.apiClient, required this.tokenStorage});

  final ApiClient apiClient;
  final TokenStorage tokenStorage;
}

class _MockAuthRepository implements AuthRepository {
  @override
  Future<void> register({
    required String email,
    required String password,
    required String fullName,
  }) async {}

  @override
  Future<AuthTokens> login({
    required String email,
    required String password,
  }) async {
    return const AuthTokens(
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'bearer',
    );
  }

  @override
  Future<void> logout() async {}
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key, required this.initialIndex});

  final int initialIndex;

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _loadedAfterLogin = false;

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = context.watch<AuthSession>().isAuthenticated;
    if (!isAuthenticated) {
      _loadedAfterLogin = false;
      return const LoginScreen(showBackButton: false);
    }

    if (!_loadedAfterLogin) {
      _loadedAfterLogin = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          context.read<EggBloomState>().loadInitialData();
        }
      });
    }

    return MainNavigator(initialIndex: widget.initialIndex);
  }
}

class MainNavigator extends StatefulWidget {
  const MainNavigator({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    HomeScreen(),
    CollectScreen(),
    MarketListScreen(),
    ExperienceScreen(),
    MyScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = _normalizedIndex(widget.initialIndex);
  }

  @override
  void didUpdateWidget(covariant MainNavigator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialIndex != oldWidget.initialIndex) {
      _currentIndex = _normalizedIndex(widget.initialIndex);
    }
  }

  int _normalizedIndex(int index) {
    if (index < 0 || index >= _screens.length) {
      return 0;
    }
    return index;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
