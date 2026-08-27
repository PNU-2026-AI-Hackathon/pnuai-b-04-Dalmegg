class Market {
  const Market({
    required this.id,
    required this.name,
    required this.loc,
    required this.badge,
    required this.dist,
    required this.svgAsset,
  });

  final String id;
  final String name;
  final String loc;
  final String badge;
  final String dist;
  final String svgAsset;
}

class FlowerMarket {
  const FlowerMarket({
    required this.id,
    required this.name,
    required this.location,
    required this.badge,
    required this.distance,
    required this.openHours,
    required this.minimumOrder,
    required this.svgAsset,
    required this.products,
  });

  final String id;
  final String name;
  final String location;
  final String badge;
  final String distance;
  final String openHours;
  final String minimumOrder;
  final String svgAsset;
  final List<FlowerProduct> products;
}

class FlowerProduct {
  const FlowerProduct({
    required this.id,
    required this.flowerId,
    required this.name,
    required this.price,
    required this.emoji,
    required this.backgroundColorHex,
  });

  final String id;
  final int flowerId;
  final String name;
  final String price;
  final String emoji;
  final int backgroundColorHex;
}

const markets = [
  Market(
    id: 'dohwa',
    name: '도화농장',
    loc: '부산 금정구',
    badge: 'ESG인증',
    dist: '0.8km',
    svgAsset: 'assets/illustrations/smart_farm.svg',
  ),
  Market(
    id: 'lavender',
    name: '라벤더힐',
    loc: '부산 해운대구',
    badge: '베스트',
    dist: '2.3km',
    svgAsset: 'assets/illustrations/flower_shop.svg',
  ),
  Market(
    id: 'sunshine',
    name: '햇살농원',
    loc: '부산 기장군',
    badge: 'ESG인증',
    dist: '5.1km',
    svgAsset: 'assets/illustrations/smart_farm.svg',
  ),
];

const flowerMarkets = [
  FlowerMarket(
    id: 'dohwa',
    name: '도화농장',
    location: '부산 금정구 장전동',
    badge: 'ESG인증',
    distance: '0.8km',
    openHours: '09:00–18:00',
    minimumOrder: '10,000원',
    svgAsset: 'assets/illustrations/smart_farm.svg',
    products: [
      FlowerProduct(
        id: 'pink-tulip',
        flowerId: 1,
        name: '분홍 튤립',
        price: '6,800원',
        emoji: '🌷',
        backgroundColorHex: 0xFFFDE8EC,
      ),
      FlowerProduct(
        id: 'yellow-freesia',
        flowerId: 2,
        name: '노란 프리지아',
        price: '4,200원',
        emoji: '🌼',
        backgroundColorHex: 0xFFFFF7D6,
      ),
      FlowerProduct(
        id: 'mini-gerbera',
        flowerId: 3,
        name: '미니 거베라',
        price: '9,500원',
        emoji: '🌸',
        backgroundColorHex: 0xFFFCE4EC,
      ),
    ],
  ),
  FlowerMarket(
    id: 'lavender',
    name: '라벤더힐',
    location: '부산 해운대구',
    badge: '베스트',
    distance: '2.3km',
    openHours: '09:00–18:00',
    minimumOrder: '10,000원',
    svgAsset: 'assets/illustrations/flower_shop.svg',
    products: [
      FlowerProduct(
        id: 'pink-tulip',
        flowerId: 1,
        name: '분홍 튤립',
        price: '6,800원',
        emoji: '🌷',
        backgroundColorHex: 0xFFFDE8EC,
      ),
      FlowerProduct(
        id: 'yellow-freesia',
        flowerId: 2,
        name: '노란 프리지아',
        price: '4,200원',
        emoji: '🌼',
        backgroundColorHex: 0xFFFFF7D6,
      ),
      FlowerProduct(
        id: 'mini-gerbera',
        flowerId: 3,
        name: '미니 거베라',
        price: '9,500원',
        emoji: '🌸',
        backgroundColorHex: 0xFFFCE4EC,
      ),
    ],
  ),
  FlowerMarket(
    id: 'sunshine',
    name: '햇살농원',
    location: '부산 기장군',
    badge: 'ESG인증',
    distance: '5.1km',
    openHours: '09:00–18:00',
    minimumOrder: '10,000원',
    svgAsset: 'assets/illustrations/smart_farm.svg',
    products: [
      FlowerProduct(
        id: 'pink-tulip',
        flowerId: 1,
        name: '분홍 튤립',
        price: '6,800원',
        emoji: '🌷',
        backgroundColorHex: 0xFFFDE8EC,
      ),
      FlowerProduct(
        id: 'yellow-freesia',
        flowerId: 2,
        name: '노란 프리지아',
        price: '4,200원',
        emoji: '🌼',
        backgroundColorHex: 0xFFFFF7D6,
      ),
      FlowerProduct(
        id: 'mini-gerbera',
        flowerId: 3,
        name: '미니 거베라',
        price: '9,500원',
        emoji: '🌸',
        backgroundColorHex: 0xFFFCE4EC,
      ),
    ],
  ),
];

FlowerMarket findFlowerMarket(String id) {
  return flowerMarkets.firstWhere(
    (market) => market.id == id,
    orElse: () => flowerMarkets.first,
  );
}
