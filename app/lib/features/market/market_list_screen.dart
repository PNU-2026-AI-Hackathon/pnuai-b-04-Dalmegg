import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';

import '../../models/shop.dart';
import '../../providers/app_state.dart';
import '../../shared/widgets/market_card.dart';
import '../../theme/app_theme.dart';
import 'models/market.dart';

class MarketListScreen extends StatefulWidget {
  const MarketListScreen({super.key});

  @override
  State<MarketListScreen> createState() => _MarketListScreenState();
}

class _MarketListScreenState extends State<MarketListScreen> {
  static const _categories = ['전체', '베스트', '거리순'];

  String _selectedCategory = '전체';

  List<Market> _visibleMarkets(List<Market> sourceMarkets) {
    final filtered = switch (_selectedCategory) {
      '베스트' => sourceMarkets
          .where((market) => market.badge == '베스트')
          .toList(),
      '거리순' => [...sourceMarkets]..sort(_sortByDistance),
      _ => sourceMarkets,
    };

    return filtered;
  }

  static int _sortByDistance(Market a, Market b) {
    return _distanceValue(a.dist).compareTo(_distanceValue(b.dist));
  }

  static double _distanceValue(String value) {
    return double.tryParse(value.replaceAll('km', '').trim()) ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<EggBloomState>();
    final sourceMarkets = _marketsFromShops(appState.shops);
    final visibleMarkets = _visibleMarkets(sourceMarkets);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: const Text('꽃마켓'),
            backgroundColor: Colors.transparent,
            scrolledUnderElevation: 0,
            foregroundColor: AppColors.foreground,
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 56),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const _MarketSearchField(),
                const SizedBox(height: 14),
                const _EsgBanner(),
                const SizedBox(height: 14),
                _CategoryFilter(
                  categories: _categories,
                  selectedCategory: _selectedCategory,
                  onSelected: (category) {
                    setState(() => _selectedCategory = category);
                  },
                ),
                const SizedBox(height: 14),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  child: _MarketListBody(
                    key: ValueKey(
                      '$_selectedCategory-${appState.isLoading}-${visibleMarkets.length}',
                    ),
                    isLoading: appState.isLoading,
                    errorMessage: appState.errorMessage,
                    markets: visibleMarkets,
                  ),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  List<Market> _marketsFromShops(List<Shop> shops) {
    return [
      for (var index = 0; index < shops.length; index += 1)
        Market(
          id: shops[index].id.toString(),
          name: shops[index].name,
          loc: _locationLabel(shops[index]),
          badge: shops[index].averageRating >= 4.7 ? '베스트' : 'ESG인증',
          dist: _distanceLabel(index),
          svgAsset: index.isEven
              ? 'assets/illustrations/smart_farm.svg'
              : 'assets/illustrations/flower_shop.svg',
        ),
    ];
  }

  String _locationLabel(Shop shop) {
    if (shop.address.isEmpty) {
      return shop.region;
    }
    final parts = shop.address.split(' ');
    if (parts.length >= 2) {
      return '${parts[0]} ${parts[1]}';
    }
    return shop.address;
  }

  String _distanceLabel(int index) {
    const distances = ['0.8km', '2.3km', '5.1km', '7.4km'];
    return distances[index % distances.length];
  }
}

class _MarketListBody extends StatelessWidget {
  const _MarketListBody({
    super.key,
    required this.isLoading,
    required this.errorMessage,
    required this.markets,
  });

  final bool isLoading;
  final String? errorMessage;
  final List<Market> markets;

  @override
  Widget build(BuildContext context) {
    if (isLoading && markets.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 32),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (errorMessage != null && markets.isEmpty) {
      return _EmptyMarketMessage(message: errorMessage!);
    }

    if (markets.isEmpty) {
      return const _EmptyMarketMessage(message: '입점된 꽃마켓이 없습니다.');
    }

    return Column(
      children: [
        for (final market in markets) ...[
          MarketCard(market: market),
          if (market != markets.last) const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _EmptyMarketMessage extends StatelessWidget {
  const _EmptyMarketMessage({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Text(
          message,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.muted,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _MarketSearchField extends StatelessWidget {
  const _MarketSearchField();

  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: InputDecoration(
        hintText: '마켓 또는 꽃 이름 검색',
        prefixIcon: const Icon(Icons.search_rounded),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

class _EsgBanner extends StatelessWidget {
  const _EsgBanner();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.greenLight],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          SvgPicture.asset('assets/illustrations/recycle.svg', width: 40),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '당신의 계란껍질이 꽃이 됩니다',
                  style: textTheme.bodyMedium?.copyWith(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'ESG 인증 마켓만 입점',
                  style: textTheme.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryFilter extends StatelessWidget {
  const _CategoryFilter({
    required this.categories,
    required this.selectedCategory,
    required this.onSelected,
  });

  final List<String> categories;
  final String selectedCategory;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SizedBox(
      height: 32,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category == selectedCategory;

          return InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => onSelected(category),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              height: 32,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                category,
                style: textTheme.labelMedium?.copyWith(
                  color: isSelected ? Colors.white : AppColors.muted,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
