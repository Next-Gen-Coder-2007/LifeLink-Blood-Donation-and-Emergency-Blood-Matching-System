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

  Color _getTierColor(String tier) {
    if (tier.contains('Platinum')) return const Color(0xFF9333EA);
    if (tier.contains('Gold')) return const Color(0xFFD97706);
    if (tier.contains('Silver')) return const Color(0xFF475569);
    return const Color(0xFFB45309);
  }

  Color _getTierBg(String tier) {
    if (tier.contains('Platinum')) return const Color(0xFFFAF5FF);
    if (tier.contains('Gold')) return const Color(0xFFFFFBEB);
    if (tier.contains('Silver')) return const Color(0xFFF1F5F9);
    return const Color(0xFFFEF3C7);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final donorProvider = context.watch<DonorProvider>();
    final donor = auth.donorProfile;
    final history = donorProvider.history;
    final donorGroup = donor?.bloodGroup ?? auth.user?.bloodGroup ?? 'O+';
    final donorId = donor?.id ?? auth.user?.profileId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Donation History & Badges'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () {
              donorProvider.loadDonorData(
                donorId: donorId,
                donorGroup: donorGroup,
                donorLat: auth.userLat,
                donorLng: auth.userLng,
              );
            },
            tooltip: 'Refresh Records',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => donorProvider.loadDonorData(
          donorId: donorId,
          donorGroup: donorGroup,
          donorLat: auth.userLat,
          donorLng: auth.userLng,
        ),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Tier & Impact Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      _getTierBg(donorProvider.heroTier),
                      Colors.white,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _getTierColor(donorProvider.heroTier).withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _getTierColor(donorProvider.heroTier).withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.award, size: 28, color: _getTierColor(donorProvider.heroTier)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                donorProvider.heroTier,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: _getTierColor(donorProvider.heroTier),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryRedLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  donorGroup,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: AppTheme.primaryRed,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            donorProvider.daysSinceLastDonation != null
                                ? 'Last donation recorded ${donorProvider.daysSinceLastDonation} days ago'
                                : 'Active emergency volunteer in LifeLink registry',
                            style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Summary Metrics Row
              Row(
                children: [
                  Expanded(
                    child: StatTile(
                      title: 'Verified Log',
                      value: '${donorProvider.totalDonations}',
                      icon: LucideIcons.shieldCheck,
                      iconColor: AppTheme.medicalEmerald,
                      iconBgColor: AppTheme.medicalEmeraldLight,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: StatTile(
                      title: 'Units Donated',
                      value: '${donorProvider.totalDonatedUnits}',
                      icon: LucideIcons.droplets,
                      iconColor: AppTheme.primaryRed,
                      iconBgColor: AppTheme.primaryRedLight,
                    ),
                  ),
                  const SizedBox(width: 10),
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
              const SizedBox(height: 20),

              // Availability Quick Toggle Bar
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Row(
                  children: [
                    Icon(
                      donor?.availability == true ? LucideIcons.checkCircle2 : LucideIcons.moon,
                      color: donor?.availability == true ? AppTheme.medicalEmerald : AppTheme.slate400,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            donor?.availability == true ? 'Available for Hospital Triage' : 'Marked Inactive / Resting',
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppTheme.slate900),
                          ),
                          const Text(
                            'Toggle status for incoming emergency alerts',
                            style: TextStyle(fontSize: 10, color: AppTheme.slate500),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: donor?.availability ?? true,
                      activeTrackColor: AppTheme.medicalEmerald,
                      activeThumbColor: Colors.white,
                      onChanged: (val) {
                        auth.updateDonorAvailability(val);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Digital Certificates List Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Digital Verified Certificates',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.slate100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${history.length} Certificates',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.slate700),
                    ),
                  ),
                ],
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
                        'When you pledge and complete a blood donation at a registered medical center, your official digital certificate will appear here with cryptographic validation.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.4),
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
