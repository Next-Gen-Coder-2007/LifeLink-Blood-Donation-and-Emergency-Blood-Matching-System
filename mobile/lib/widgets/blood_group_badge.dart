import 'package:flutter/material.dart';
import '../config/theme.dart';

class BloodGroupBadge extends StatelessWidget {
  final String bloodGroup;
  final bool isLarge;
  final bool isSelected;
  final VoidCallback? onTap;

  const BloodGroupBadge({
    super.key,
    required this.bloodGroup,
    this.isLarge = false,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isSelected
        ? AppTheme.primaryRed
        : AppTheme.primaryRedLight;
    final text = isSelected
        ? Colors.white
        : AppTheme.primaryRedDark;
    final border = isSelected
        ? AppTheme.primaryRed
        : const Color(0xFFFECACA);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(isLarge ? 14 : 8),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isLarge ? 16 : 8,
          vertical: isLarge ? 10 : 4,
        ),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(isLarge ? 14 : 8),
          border: Border.all(color: border, width: 1),
        ),
        child: Text(
          bloodGroup,
          style: TextStyle(
            color: text,
            fontWeight: FontWeight.w900,
            fontSize: isLarge ? 15 : 11,
          ),
        ),
      ),
    );
  }
}
