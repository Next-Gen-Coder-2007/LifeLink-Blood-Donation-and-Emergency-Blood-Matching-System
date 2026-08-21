import 'package:flutter/material.dart';
import '../config/app_icons.dart';
import '../config/theme.dart';
import '../models/history_model.dart';
import 'blood_group_badge.dart';

class CertificateCard extends StatelessWidget {
  final DonationHistoryModel history;
  final VoidCallback? onTap;

  const CertificateCard({
    super.key,
    required this.history,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        children: [
          // Certificate Header Ribbon
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: AppTheme.medicalEmeraldLight,
              borderRadius: BorderRadius.vertical(top: Radius.circular(17)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.award, size: 16, color: AppTheme.medicalEmerald),
                const SizedBox(width: 8),
                const Text(
                  'Verified Donation Certificate',
                  style: TextStyle(
                    color: Color(0xFF065F46),
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
                const Spacer(),
                Text(
                  history.certificateId,
                  style: const TextStyle(
                    color: Color(0xFF047857),
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            history.hospitalName,
                            style: const TextStyle(
                              color: AppTheme.slate900,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Verified by ${history.verifiedBy}',
                            style: const TextStyle(color: AppTheme.slate500, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    BloodGroupBadge(bloodGroup: history.bloodGroup),
                  ],
                ),
                const SizedBox(height: 12),

                // Metrics
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMetric('UNITS DONATED', '${history.unitsDonated} Unit (${history.unitsDonated * 450}ml)'),
                      Container(height: 24, width: 1, color: AppTheme.slate200),
                      _buildMetric('DATE', history.donationDate.split('T')[0]),
                      Container(height: 24, width: 1, color: AppTheme.slate200),
                      _buildMetric('LIVES SAVED', '${history.unitsDonated * 3} Lives'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.slate400,
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.slate800,
            fontWeight: FontWeight.w800,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
