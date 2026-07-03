import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF5A8F5C);
  static const Color lightGreen = Color(0xFFEEF7EF);
  static const Color blushPink = Color(0xFFF4B8C4);
  static const Color pinkSurface = Color(0xFFFDE8EC);
  static const Color warmIvory = Color(0xFFF7F3EE);
  static const Color warmMuted = Color(0xFFEDE8E0);
  static const Color warmBlack = Color(0xFF2D2A26);
  static const Color mutedText = Color(0xFF7A7065);

  static ThemeData get lightTheme {
    final base = ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: warmIvory,
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        secondary: blushPink,
        surface: Colors.white,
      ),
    );

    return base.copyWith(
      textTheme: GoogleFonts.notoSansKrTextTheme(
        base.textTheme,
      ).apply(bodyColor: warmBlack, displayColor: warmBlack),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: warmBlack,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shadowColor: Colors.black12,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF0EBE3),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),
    );
  }
}
