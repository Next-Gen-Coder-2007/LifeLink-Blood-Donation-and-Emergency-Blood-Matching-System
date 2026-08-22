import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/donor_provider.dart';
import '../../widgets/certificate_card.dart';
import '../../widgets/stat_tile.dart';

class DonorHistoryScreen extends StatelessWidget {
  const DonorHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final donorProvider = context.watch<DonorProvider>();
    final donor = auth.donorProfile;
    final history = donorProvider.history;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Donation History & Badges'),
      ),
      body: RefreshIndicator(
        onRefresh: () => donorProvider.loadDonorData(
          donorId: donor?.id,
          donorGroup: donor?.bloodGroup ?? 'O+',
          donorLat: auth.userLat,
          donorLng: auth.userLng,
        ),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary Metrics Row
              Row(
                children: [
                  Expanded(
                    child: StatTile(
                      title: 'Verified Donations',
                      value: '${history.length}',
                      icon: LucideIcons.award,
                      iconColor: AppTheme.medicalEmerald,
                      iconBgColor: AppTheme.medicalEmeraldLight,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatTile(
                      title: 'Units Donated',
                      value: '${donorProvider.totalDonatedUnits}',
                      icon: LucideIcons.droplets,
                      iconColor: AppTheme.primaryRed,
                      iconBgColor: AppTheme.primaryRedLight,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatTile(
                      title: 'Lives Saved',
                      value: '${donorProvider.totalLivesSaved}',
                      icon: LucideIcons.heart,
                      iconColor: AppTheme.medicalBlue,
                      iconBgColor: AppTheme.medicalBlueLight,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              const Text(
                'Digital Verified Certificates',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
              ),
              const SizedBox(height: 12),

              if (donorProvider.isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (history.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppTheme.slate200),
                  ),
                  child: const Column(
                    children: [
                      Icon(LucideIcons.award, size: 44, color: AppTheme.slate300),
                      SizedBox(height: 12),
                      Text(
                        'No Verified Donations Yet',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.slate900),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'When you pledge and complete a blood donation at a registered hospital, your verified digital certificate will appear here.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppTheme.slate500),
                      ),
                    ],
                  ),
                )
              else
                ...history.map((h) => CertificateCard(history: h)),
            ],
          ),
        ),
      ),
    );
  }
}
