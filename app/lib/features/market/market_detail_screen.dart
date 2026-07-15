import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../models/flower.dart';
import '../../models/shop.dart';
import '../../providers/app_state.dart';
import '../../providers/auth_session.dart';
import '../../repositories/order_repository.dart';
import '../../theme/app_theme.dart';
import '../../widgets/bottom_nav_bar.dart';

class MarketDetailScreen extends StatefulWidget {
  const MarketDetailScreen({super.key, required this.marketId});

  final String marketId;

  @override
  State<MarketDetailScreen> createState() => _MarketDetailScreenState();
}

class _MarketDetailScreenState extends State<MarketDetailScreen> {
  final Map<int, int> _cart = {};
  Future<List<Flower>>? _flowersFuture;
  bool _isOrdering = false;

  int get _cartCount => _cart.values.fold(0, (sum, quantity) => sum + quantity);

  int get _cartTotal {
    final flowers = _lastFlowers;
    if (flowers.isEmpty) {
      return 0;
    }
    return _cart.entries.fold(0, (sum, entry) {
      final flower = flowers.firstWhere(
        (item) => item.id == entry.key,
        orElse: () => flowers.first,
      );
      return sum + (_priceValue(flower.price) * entry.value);
    });
  }

  List<Flower> _lastFlowers = [];

  int get _shopId => int.tryParse(widget.marketId) ?? 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _flowersFuture ??= context.read<EggBloomState>().fetchFlowersByShop(_shopId);
  }

  void _addProduct(Flower product) {
    setState(() {
      _cart[product.id] = (_cart[product.id] ?? 0) + 1;
    });
  }

  void _changeProductQuantity(Flower product, int delta) {
    final nextQuantity = (_cart[product.id] ?? 0) + delta;
    setState(() {
      if (nextQuantity <= 0) {
        _cart.remove(product.id);
      } else {
        _cart[product.id] = nextQuantity;
      }
    });
  }

  Future<bool> _submitOrder() async {
    if (_cartCount == 0 || _isOrdering || _lastFlowers.isEmpty) {
      return false;
    }

    final authSession = context.read<AuthSession>();
    if (!authSession.isAuthenticated) {
      final loggedIn = await context.push<bool>('/login');
      if (!mounted || loggedIn != true) {
        return false;
      }
    }

    final items = _cart.entries.map((entry) {
      final product = _lastFlowers.firstWhere(
        (item) => item.id == entry.key,
        orElse: () => _lastFlowers.first,
      );
      return OrderItemRequest(
        flowerId: product.id,
        quantity: entry.value,
      );
    }).toList();

    setState(() => _isOrdering = true);
    try {
      await context.read<EggBloomState>().requestFlowerOrderItems(items);
      if (!mounted) return false;
      setState(_cart.clear);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('주문 요청이 완료되었습니다')),
      );
      return true;
    } catch (_) {
      if (!mounted) return false;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('주문 요청에 실패했습니다. 다시 시도해주세요')),
      );
      return false;
    } finally {
      if (mounted) {
        setState(() => _isOrdering = false);
      }
    }
  }

  void _showOrderSheet() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, sheetSetState) {
            final selectedProducts = _lastFlowers
                .where((product) => (_cart[product.id] ?? 0) > 0)
                .toList();

            return _OrderSheet(
              products: selectedProducts,
              quantities: _cart,
              total: _cartTotal,
              isOrdering: _isOrdering,
              onDecrease: (product) {
                _changeProductQuantity(product, -1);
                sheetSetState(() {});
              },
              onIncrease: (product) {
                _changeProductQuantity(product, 1);
                sheetSetState(() {});
              },
              onOrder: () async {
                sheetSetState(() {});
                final ordered = await _submitOrder();
                if (!sheetContext.mounted) return;
                sheetSetState(() {});
                if (ordered) {
                  Navigator.of(sheetContext).pop();
                }
              },
            );
          },
        );
      },
    );
  }

  static int _priceValue(String price) {
    return int.tryParse(price.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<EggBloomState>();
    final shop = _findShop(appState.shops);
    final market = _MarketDetailViewData.fromShop(shop, _shopId);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _HeroSection(market: market)),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 14),
                  _MarketInfoCard(market: market),
                  const SizedBox(height: 22),
                  const _SectionTitle(title: '꽃 상품'),
                  const SizedBox(height: 12),
                  FutureBuilder<List<Flower>>(
                    future: _flowersFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 32),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }

                      if (snapshot.hasError) {
                        return const _EmptyProductMessage(
                          message: '꽃 상품을 불러오지 못했습니다.',
                        );
                      }

                      final flowers = snapshot.data ?? [];
                      _lastFlowers = flowers;

                      if (flowers.isEmpty) {
                        return const _EmptyProductMessage(
                          message: '판매 중인 꽃 상품이 없습니다.',
                        );
                      }

                      return Column(
                        children: [
                          for (final product in flowers) ...[
                            FlowerProductCard(
                              product: product,
                              quantity: _cart[product.id] ?? 0,
                              onAdd: () => _addProduct(product),
                            ),
                            if (product != flowers.last)
                              const SizedBox(height: 12),
                          ],
                        ],
                      );
                    },
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_cartCount > 0)
            _CartOrderBar(
              count: _cartCount,
              total: _cartTotal,
              isOrdering: _isOrdering,
              onOpen: _showOrderSheet,
            ),
          BottomNavBar(
            currentIndex: 2,
            onTap: (index) => context.go('/?tab=$index'),
          ),
        ],
      ),
    );
  }

  Shop? _findShop(List<Shop> shops) {
    for (final shop in shops) {
      if (shop.id == _shopId) {
        return shop;
      }
    }
    return null;
  }
}

class _MarketDetailViewData {
  const _MarketDetailViewData({
    required this.name,
    required this.location,
    required this.badge,
    required this.distance,
    required this.openHours,
    required this.minimumOrder,
    required this.svgAsset,
  });

  final String name;
  final String location;
  final String badge;
  final String distance;
  final String openHours;
  final String minimumOrder;
  final String svgAsset;

  factory _MarketDetailViewData.fromShop(Shop? shop, int shopId) {
    return _MarketDetailViewData(
      name: shop?.name ?? '꽃마켓',
      location: shop?.address.isNotEmpty == true ? shop!.address : '부산',
      badge: (shop?.averageRating ?? 0) >= 4.7 ? '베스트' : 'ESG인증',
      distance: _distanceLabel(shopId),
      openHours: '09:00–18:00',
      minimumOrder: '10,000원',
      svgAsset: shopId.isEven
          ? 'assets/illustrations/flower_shop.svg'
          : 'assets/illustrations/smart_farm.svg',
    );
  }

  static String _distanceLabel(int shopId) {
    const distances = ['0.8km', '2.3km', '5.1km', '7.4km'];
    if (shopId <= 0) {
      return distances.first;
    }
    return distances[(shopId - 1) % distances.length];
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({required this.market});

  final _MarketDetailViewData market;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 250,
      decoration: const BoxDecoration(
        color: AppColors.greenBg,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 12,
            left: 12,
            child: _RoundIconButton(
              icon: Icons.arrow_back_rounded,
              onTap: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/?tab=2');
                }
              },
            ),
          ),
          Positioned(
            top: 16,
            right: 16,
            child: _Badge(label: market.badge),
          ),
          Center(child: SvgPicture.asset(market.svgAsset, width: 138)),
        ],
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  const _RoundIconButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: const SizedBox(
          width: 42,
          height: 42,
          child: Icon(Icons.arrow_back_rounded, color: AppColors.foreground),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isBest = label == '베스트';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isBest ? AppColors.accent : AppColors.primary,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: isBest ? const Color(0xFF7A2040) : Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _MarketInfoCard extends StatelessWidget {
  const _MarketInfoCard({required this.market});

  final _MarketDetailViewData market;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      color: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              market.name,
              maxLines: 2,
              overflow: TextOverflow.visible,
              style: textTheme.titleLarge?.copyWith(
                color: AppColors.foreground,
                fontSize: 21,
                height: 1.25,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${market.location} · ${market.distance}',
              style: textTheme.bodySmall?.copyWith(
                color: AppColors.muted,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: InfoChipCard(
                    icon: Icons.schedule_rounded,
                    label: '영업시간',
                    value: market.openHours,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InfoChipCard(
                    icon: Icons.shopping_bag_outlined,
                    label: '최소주문',
                    value: market.minimumOrder,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class InfoChipCard extends StatelessWidget {
  const InfoChipCard({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.greenBg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: textTheme.labelSmall?.copyWith(
                    color: AppColors.muted,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: textTheme.bodySmall?.copyWith(
                    color: AppColors.foreground,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
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

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
        color: AppColors.foreground,
        fontSize: 16,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

class _EmptyProductMessage extends StatelessWidget {
  const _EmptyProductMessage({required this.message});

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

class FlowerProductCard extends StatelessWidget {
  const FlowerProductCard({
    super.key,
    required this.product,
    required this.quantity,
    required this.onAdd,
  });

  final Flower product;
  final int quantity;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      color: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 64,
              height: 64,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: product.bgColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(product.emoji, style: const TextStyle(fontSize: 30)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: textTheme.titleSmall?.copyWith(
                      color: AppColors.foreground,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    product.price,
                    style: GoogleFonts.nunito(
                      color: AppColors.primary,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            Material(
              color: AppColors.primary,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: onAdd,
                child: SizedBox(
                  width: 38,
                  height: 38,
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Center(
                        child: Icon(Icons.add_rounded, color: Colors.white),
                      ),
                      if (quantity > 0)
                        Positioned(
                          top: -4,
                          right: -4,
                          child: Container(
                            width: 18,
                            height: 18,
                            alignment: Alignment.center,
                            decoration: const BoxDecoration(
                              color: AppColors.accent,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              '$quantity',
                              style: GoogleFonts.nunito(
                                color: const Color(0xFF7A2040),
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CartOrderBar extends StatelessWidget {
  const _CartOrderBar({
    required this.count,
    required this.total,
    required this.isOrdering,
    required this.onOpen,
  });

  final int count;
  final int total;
  final bool isOrdering;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppTheme.warmBorder)),
      ),
      child: SafeArea(
        top: false,
        bottom: false,
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: AppColors.greenBg,
                shape: BoxShape.circle,
              ),
              child: Text(
                '$count',
                style: GoogleFonts.nunito(
                  color: AppColors.primary,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '담은 내역',
                    style: textTheme.labelSmall?.copyWith(
                      color: AppColors.muted,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    '${_formatPrice(total)}원',
                    style: GoogleFonts.nunito(
                      color: AppColors.foreground,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: isOrdering ? null : onOpen,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(112, 44),
                padding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              child: Text(isOrdering ? '주문 중' : '내역 보기'),
            ),
          ],
        ),
      ),
    );
  }

  static String _formatPrice(int value) {
    final text = value.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < text.length; i += 1) {
      final remaining = text.length - i;
      buffer.write(text[i]);
      if (remaining > 1 && remaining % 3 == 1) {
        buffer.write(',');
      }
    }
    return buffer.toString();
  }
}

class _OrderSheet extends StatelessWidget {
  const _OrderSheet({
    required this.products,
    required this.quantities,
    required this.total,
    required this.isOrdering,
    required this.onDecrease,
    required this.onIncrease,
    required this.onOrder,
  });

  final List<Flower> products;
  final Map<int, int> quantities;
  final int total;
  final bool isOrdering;
  final ValueChanged<Flower> onDecrease;
  final ValueChanged<Flower> onIncrease;
  final Future<void> Function() onOrder;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.only(
          left: 18,
          right: 18,
          bottom: MediaQuery.of(context).viewInsets.bottom + 18,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '담은 꽃',
              style: textTheme.titleMedium?.copyWith(
                color: AppColors.foreground,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '아래 내역으로 주문 요청합니다.',
              style: textTheme.bodySmall?.copyWith(
                color: AppColors.muted,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            if (products.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.greenBg,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '담은 꽃이 없습니다.',
                  textAlign: TextAlign.center,
                  style: textTheme.bodySmall?.copyWith(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              )
            else
              for (final product in products) ...[
                _OrderSheetItem(
                  product: product,
                  quantity: quantities[product.id] ?? 0,
                  onDecrease: () => onDecrease(product),
                  onIncrease: () => onIncrease(product),
                ),
                if (product != products.last) const SizedBox(height: 10),
              ],
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.greenBg,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Text(
                    '총 주문금액',
                    style: textTheme.bodyMedium?.copyWith(
                      color: AppColors.foreground,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${_formatPrice(total)}원',
                    style: GoogleFonts.nunito(
                      color: AppColors.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isOrdering || products.isEmpty ? null : onOrder,
                child: Text(isOrdering ? '주문 중' : '주문하기'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderSheetItem extends StatelessWidget {
  const _OrderSheetItem({
    required this.product,
    required this.quantity,
    required this.onDecrease,
    required this.onIncrease,
  });

  final Flower product;
  final int quantity;
  final VoidCallback onDecrease;
  final VoidCallback onIncrease;

  @override
  Widget build(BuildContext context) {
    final lineAmount = _priceValue(product.price) * quantity;

    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: product.bgColor,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Text(product.emoji, style: const TextStyle(fontSize: 24)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                product.name,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.foreground,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '${product.price} x $quantity',
                style: GoogleFonts.nunito(
                  color: AppColors.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${_formatPrice(lineAmount)}원',
              style: GoogleFonts.nunito(
                color: AppColors.foreground,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            _QuantityStepper(
              quantity: quantity,
              onDecrease: onDecrease,
              onIncrease: onIncrease,
            ),
          ],
        ),
      ],
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  const _QuantityStepper({
    required this.quantity,
    required this.onDecrease,
    required this.onIncrease,
  });

  final int quantity;
  final VoidCallback onDecrease;
  final VoidCallback onIncrease;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      decoration: BoxDecoration(
        color: AppColors.greenBg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepperButton(icon: Icons.remove_rounded, onTap: onDecrease),
          SizedBox(
            width: 28,
            child: Text(
              '$quantity',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                color: AppColors.foreground,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          _StepperButton(icon: Icons.add_rounded, onTap: onIncrease),
        ],
      ),
    );
  }
}

class _StepperButton extends StatelessWidget {
  const _StepperButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      customBorder: const CircleBorder(),
      onTap: onTap,
      child: SizedBox(
        width: 30,
        height: 30,
        child: Icon(icon, size: 17, color: AppColors.primary),
      ),
    );
  }
}

String _formatPrice(int value) {
  final text = value.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < text.length; i += 1) {
    final remaining = text.length - i;
    buffer.write(text[i]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }
  return buffer.toString();
}

int _priceValue(String price) {
  return int.tryParse(price.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
}
