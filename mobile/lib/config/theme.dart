import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Medical Color Palette
  static const Color primaryRed = Color(0xFFEF4444); // #ef4444
  static const Color primaryRedDark = Color(0xFFDC2626); // #dc2626
  static const Color primaryRedLight = Color(0xFFFEF2F2); // #fef2f2

  static const Color medicalBlue = Color(0xFF2563EB); // #2563eb
  static const Color medicalBlueLight = Color(0xFFEFF6FF); // #eff6ff

  static const Color medicalEmerald = Color(0xFF10B981); // #10b981
  static const Color medicalEmeraldLight = Color(0xFFECFDF5); // #ecfdf5

  static const Color medicalAmber = Color(0xFFF59E0B); // #f59e0b
  static const Color medicalAmberLight = Color(0xFFFFFBEB); // #fffbeb

  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate900 = Color(0xFF0F172A);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryRed,
      scaffoldBackgroundColor: const Color(0xFFF9FAFB),
      colorScheme: const ColorScheme.light(
        primary: primaryRed,
        onPrimary: Colors.white,
        secondary: medicalBlue,
        onSecondary: Colors.white,
        surface: Colors.white,
        onSurface: slate900,
        error: primaryRedDark,
        onError: Colors.white,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontWeight: FontWeight.w900, color: slate900, fontSize: 32),
        displayMedium: GoogleFonts.inter(fontWeight: FontWeight.w800, color: slate900, fontSize: 26),
        titleLarge: GoogleFonts.inter(fontWeight: FontWeight.w700, color: slate900, fontSize: 18),
        titleMedium: GoogleFonts.inter(fontWeight: FontWeight.w600, color: slate800, fontSize: 15),
        bodyLarge: GoogleFonts.inter(fontWeight: FontWeight.w400, color: slate700, fontSize: 14),
        bodyMedium: GoogleFonts.inter(fontWeight: FontWeight.w400, color: slate600, fontSize: 13),
        bodySmall: GoogleFonts.inter(fontWeight: FontWeight.w500, color: slate400, fontSize: 11),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0.5,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: GoogleFonts.inter(
          color: slate900,
          fontWeight: FontWeight.w800,
          fontSize: 18,
        ),
        iconTheme: const IconThemeData(color: slate800),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryRed,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: slate50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: slate200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: slate200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryRed, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(color: slate400, fontSize: 13),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: slate200, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      dividerTheme: const DividerThemeData(
        color: slate100,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
