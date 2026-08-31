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

  void _showCertificateDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFFDE68A), width: 3),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFD97706).withValues(alpha: 0.15),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Golden Crest Header
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(21)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryRed,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(LucideIcons.droplet, color: Colors.white, size: 22),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'LifeLink',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: AppTheme.slate900,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFDE68A),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.award, size: 14, color: Color(0xFF92400E)),
                            SizedBox(width: 6),
                            Text(
                              'OFFICIAL TRANSFUSION VERIFICATION',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF92400E),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Certificate of Life-Saving Contribution',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.slate900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Awarded in recognition of voluntary clinical blood donation.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 11, color: AppTheme.slate500),
                      ),
                    ],
                  ),
                ),

                // Recipient & Details Body
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Text(
                        'PRESENTED TO',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.slate400,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        history.donorName,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primaryRed,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'For donating ${history.units} Unit(s) (${history.units * 450}ml) of Group ${history.bloodGroup} Blood',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.slate700,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Information Grid Box
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.slate50,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.slate200),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                const Icon(LucideIcons.building2, size: 16, color: AppTheme.medicalBlue),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'MEDICAL FACILITY',
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppTheme.slate400),
                                      ),
                                      Text(
                                        history.hospitalName,
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate800),
                                      ),
                                      if (history.hospitalAddress.isNotEmpty)
                                        Text(
                                          history.hospitalAddress,
                                          style: const TextStyle(fontSize: 10, color: AppTheme.slate500),
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 16, color: AppTheme.slate200),
                            Row(
                              children: [
                                const Icon(LucideIcons.calendar, size: 16, color: AppTheme.medicalEmerald),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'DONATION DATE & RECORD',
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppTheme.slate400),
                                      ),
                                      Text(
                                        history.donationDate.split('T')[0],
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate800),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.medicalEmeraldLight,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    '3 LIVES SAVED',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.medicalEmerald),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Verification Footer
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: AppTheme.medicalEmeraldLight,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.shieldCheck, size: 18, color: AppTheme.medicalEmerald),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Clinically Verified Record',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF065F46)),
                                ),
                                Text(
                                  'LifeLink Transfusion Registry',
                                  style: TextStyle(fontSize: 10, color: AppTheme.slate400),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.slate100,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppTheme.slate200),
                            ),
                            child: Text(
                              history.certificateId,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.slate800,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.pop(ctx),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('Close', style: TextStyle(fontWeight: FontWeight.w800, color: AppTheme.slate600)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Certificate #${history.certificateId} saved to documents.'),
                                    backgroundColor: AppTheme.medicalEmerald,
                                  ),
                                );
                              },
                              icon: const Icon(LucideIcons.download, size: 16),
                              label: const Text('Save / Share', style: TextStyle(fontWeight: FontWeight.w800)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.slate900,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap ?? () => _showCertificateDialog(context),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.slate200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
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
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Text(
                      history.certificateId,
                      style: const TextStyle(
                        color: Color(0xFF047857),
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                      ),
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
                                fontWeight: FontWeight.w900,
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
                        _buildMetric('UNITS', '${history.units} Unit (${history.units * 450}ml)'),
                        Container(height: 24, width: 1, color: AppTheme.slate200),
                        _buildMetric('DATE', history.donationDate.split('T')[0]),
                        Container(height: 24, width: 1, color: AppTheme.slate200),
                        _buildMetric('LIVES SAVED', '${history.units * 3} Lives'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Tap to View Prompt
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        'Tap to View Official Certificate',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.medicalBlue,
                        ),
                      ),
                      SizedBox(width: 4),
                      Icon(LucideIcons.chevronRight, size: 14, color: AppTheme.medicalBlue),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
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
            fontWeight: FontWeight.w900,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
