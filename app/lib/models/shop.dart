class Shop {
  const Shop({
    required this.id,
    required this.name,
    required this.region,
    required this.address,
    required this.phone,
    required this.description,
    required this.averageRating,
    required this.reviewCount,
  });

  final int id;
  final String name;
  final String region;
  final String address;
  final String phone;
  final String description;
  final double averageRating;
  final int reviewCount;

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'] as int,
      name: json['name'] as String,
      region: json['region'] as String? ?? '',
      address: json['address'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      description: json['description'] as String? ?? '',
      averageRating: (json['average_rating'] as num?)?.toDouble() ?? 0,
      reviewCount: json['review_count'] as int? ?? 0,
    );
  }
}
