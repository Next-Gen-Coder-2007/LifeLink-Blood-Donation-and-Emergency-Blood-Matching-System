import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../../providers/notification_provider.dart';
import '../../widgets/blood_group_badge.dart';
import '../../widgets/stat_tile.dart';
import '../../widgets/urgency_pill.dart';
import '../common/notifications_screen.dart';
import 'create_request_screen.dart';
import 'hospital_settings_screen.dart';

class HospitalDashboardScreen extends StatelessWidget {
  const HospitalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final hospProvider = context.watch<HospitalProvider>();
    final notifProvider = context.watch<NotificationProvider>();

    final hosp = auth.hospitalProfile;
    final activeReqs = hospProvider.hospitalRequests.where((r) => r.status == 'searching').toList();
    final activePledges = hospProvider.hospitalPledges.where((p) => p.status == 'pledged' || p.status == 'acknowledged').toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: AppTheme.medicalBlueLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(LucideIcons.building2, color: AppTheme.medicalBlue, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hosp?.hospitalName ?? auth.user?.name ?? 'Medical Facility',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                ),
                const Text(
                  'Hospital Triage Center',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate500),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Stack(
            children: [
              IconButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
                },
                icon: const Icon(LucideIcons.bell, size: 20, color: AppTheme.slate700),
              ),
              if (notifProvider.unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryRed,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${notifProvider.unreadCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const HospitalSettingsScreen()));
            },
            icon: const Icon(LucideIcons.settings, size: 20, color: AppTheme.slate700),
            tooltip: 'Facility Settings',
          ),
          const SizedBox(width: 4),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateRequestScreen()));
        },
        backgroundColor: AppTheme.primaryRed,
        icon: const Icon(LucideIcons.plus, color: Colors.white),
        label: const Text('Broadcast Need', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          final hospId = hosp?.id ?? auth.user?.profileId;
          if (hospId != null && hospId.isNotEmpty) {
            await hospProvider.loadHospitalData(
              hospitalId: hospId,
              hospitalLat: (hosp?.latitude != null && hosp!.latitude != 0) ? hosp.latitude : auth.userLat,
              hospitalLng: (hosp?.longitude != null && hosp!.longitude != 0) ? hosp.longitude : auth.userLng,
            );
          }
          if (auth.user != null) {
            await notifProvider.fetchNotifications(auth.user!.id, role: 'hospital');
          }
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Metrics Row
              Row(
                children: [
                  Expanded(
                    child: StatTile(
                      title: 'Active Requests',
                      value: '${activeReqs.length}',
                      icon: LucideIcons.radio,
                      iconColor: AppTheme.primaryRed,
                      iconBgColor: AppTheme.primaryRedLight,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatTile(
                      title: 'Donor Pledges',
                      value: '${activePledges.length}',
                      icon: LucideIcons.heartHandshake,
                      iconColor: AppTheme.medicalBlue,
                      iconBgColor: AppTheme.medicalBlueLight,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatTile(
                      title: 'Blood Stock',
                      value: '${hospProvider.totalStockUnits} U',
                      icon: LucideIcons.layers,
                      iconColor: AppTheme.medicalEmerald,
                      iconBgColor: AppTheme.medicalEmeraldLight,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Active Committed Pledges
              if (activePledges.isNotEmpty) ...[
                const Text(
                  'Incoming Committed Donors',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                ),
                const SizedBox(height: 10),
                ...activePledges.map((p) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF86EFAC)),
                      ),
                      child: Row(
                        children: [
                          BloodGroupBadge(bloodGroup: p.bloodGroup),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.donorName,
                                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.slate900),
                                ),
                                Text(
                                  'ETA: ${p.estimatedArrival ?? "En route"} • ${p.donorPhone}',
                                  style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              _showVerifyDialog(context, p);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.medicalEmerald,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Verify & Bank', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 16),
              ],

              // Active Broadcast Requests
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Active Emergency Broadcasts',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                  ),
                  Text(
                    '${activeReqs.length} Broadcasting',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.slate500),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (hospProvider.isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (activeReqs.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppTheme.slate200),
                  ),
                  child: Column(
                    children: [
                      const Icon(LucideIcons.radio, size: 36, color: AppTheme.slate300),
                      const SizedBox(height: 10),
                      const Text(
                        'No Active Broadcasts',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.slate900),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Tap the button below to broadcast an emergency blood requirement to nearby volunteer donors.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppTheme.slate500),
                      ),
                    ],
                  ),
                )
              else
                ...activeReqs.map((req) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppTheme.slate200),
                      ),
                      child: Row(
                        children: [
                          BloodGroupBadge(bloodGroup: req.bloodGroup),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    UrgencyPill(urgency: req.urgency),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${req.unitsRequired} Units Needed',
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.slate900),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  req.patientName != null ? 'Patient: ${req.patientName}' : 'General Emergency Broadcast',
                                  style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                                ),
                              ],
                            ),
                          ),
                          OutlinedButton(
                            onPressed: () {
                              hospProvider.fulfillRequest(req.id);
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF86EFAC)),
                              backgroundColor: AppTheme.medicalEmeraldLight,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            ),
                            child: const Text('Mark Fulfilled', style: TextStyle(color: Color(0xFF065F46), fontSize: 11, fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ),
                    )),
            ],
          ),
        ),
      ),
    );
  }

  void _showVerifyDialog(BuildContext context, dynamic pledge) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Verify Blood Donation', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        content: Text('Confirm and verify ${pledge.donorName}\'s blood donation (${pledge.bloodGroup})? This will issue a verified digital certificate and update facility inventory.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = context.read<HospitalProvider>();
              final auth = context.read<AuthProvider>();
              await provider.verifyDonationPledge(
                pledgeId: pledge.id,
                hospitalId: pledge.hospitalId,
                donorId: pledge.donorId,
                donorName: pledge.donorName,
                bloodGroup: pledge.bloodGroup,
                unitsDonated: 1,
                verifiedBy: auth.hospitalProfile?.hospitalName ?? 'Hospital Staff',
              );
              final hospId = auth.hospitalProfile?.id ?? auth.user?.profileId;
              if (hospId != null && hospId.isNotEmpty) {
                provider.loadHospitalData(
                  hospitalId: hospId,
                  hospitalLat: auth.userLat,
                  hospitalLng: auth.userLng,
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.medicalEmerald),
            child: const Text('Confirm & Verify'),
          ),
        ],
      ),
    );
  }
}
