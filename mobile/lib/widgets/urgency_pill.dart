import 'package:flutter/material.dart';
import '../config/theme.dart';

class UrgencyPill extends StatelessWidget {
  final String urgency; // 'normal' | 'urgent' | 'emergency'

  const UrgencyPill({super.key, required this.urgency});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color border;
    String label;

    switch (urgency.toLowerCase()) {
      case 'emergency':
        bg = AppTheme.primaryRedLight;
        text = AppTheme.primaryRedDark;
        border = const Color(0xFFFECACA);
        label = 'Emergency';
        break;
      case 'urgent':
        bg = AppTheme.medicalAmberLight;
        text = const Color(0xFFB45309);
        border = const Color(0xFFFDE68A);
        label = 'Urgent';
        break;
      default:
        bg = AppTheme.medicalBlueLight;
        text = AppTheme.medicalBlue;
        border = const Color(0xFFBFDBFE);
        label = 'Standard';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: text,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
