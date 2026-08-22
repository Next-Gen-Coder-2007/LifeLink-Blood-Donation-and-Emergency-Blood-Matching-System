import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/donor_provider.dart';
import '../../providers/notification_provider.dart';
import '../../widgets/stat_tile.dart';
import '../../widgets/request_card.dart';
import '../../widgets/pledge_modal_sheet.dart';
import '../common/notifications_screen.dart';
import '../common/live_radar_map_screen.dart';

class DonorDashboardScreen extends StatelessWidget {
  const DonorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final donorProvider = context.watch<DonorProvider>();
    final notifProvider = context.watch<NotificationProvider>();

    final donor = auth.donorProfile;
    final donorGroup = donor?.bloodGroup ?? auth.user?.bloodGroup ?? 'O+';
    final filteredRequests = donorProvider.getFilteredRequests(donorGroup);
    final activePledges = donorProvider.pledges.where((p) => p.status == 'pledged' || p.status == 'acknowledged').toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: AppTheme.primaryRedLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(LucideIcons.droplet, color: AppTheme.primaryRed, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  donor?.donorName ?? auth.user?.name ?? 'Volunteer Donor',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                ),
                Text(
                  'Verified Donor • $donorGroup',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate500),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveRadarMapScreen()));
            },
            icon: const Icon(LucideIcons.compass, size: 20, color: AppTheme.medicalBlue),
            tooltip: 'Live Hospital Radar',
          ),
          Stack(
            children: [
              IconButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
                },
                icon: const Icon(LucideIcons.bell, size: 20, color: AppTheme.slate700),
                tooltip: 'Alerts',
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
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await donorProvider.loadDonorData(
            donorId: donor?.id,
            donorGroup: donorGroup,
            donorLat: auth.userLat,
            donorLng: auth.userLng,
          );
          if (auth.user != null) {
            await notifProvider.fetchNotifications(auth.user!.id, role: 'donor');
          }
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Availability Autonomy Toggle Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: donor?.availability == true ? AppTheme.medicalEmeraldLight : AppTheme.slate100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        donor?.availability == true ? LucideIcons.checkCircle2 : LucideIcons.moon,
                        color: donor?.availability == true ? AppTheme.medicalEmerald : AppTheme.slate400,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            donor?.availability == true ? 'Ready to Donate Blood' : 'Currently Marked Resting',
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.slate900),
                          ),
                          Text(
                            donor?.availability == true
                              ? 'Hospitals can match your $donorGroup profile'
                              : 'Tap to switch to available anytime',
                            style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: donor?.availability ?? true,
                      onChanged: (val) {
                        auth.updateDonorAvailability(val);
                      },
                      activeTrackColor: AppTheme.medicalEmerald,
                      activeThumbColor: Colors.white,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Metric Stats Row
              Row(
                children: [
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
                      iconColor: AppTheme.medicalEmerald,
                      iconBgColor: AppTheme.medicalEmeraldLight,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatTile(
                      title: 'Active Pledges',
                      value: '${activePledges.length}',
                      icon: LucideIcons.heartHandshake,
                      iconColor: AppTheme.medicalBlue,
                      iconBgColor: AppTheme.medicalBlueLight,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Active Pledges Banner
              if (activePledges.isNotEmpty) ...[
                const Text(
                  'Active Committed Pledges',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                ),
                const SizedBox(height: 8),
                ...activePledges.map((p) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF86EFAC)),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.checkCircle2, color: Color(0xFF16A34A), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.hospitalName,
                                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF14532D)),
                                ),
                                Text(
                                  'Arrival ETA: ${p.estimatedArrival ?? "Committed"}',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF15803D)),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () => donorProvider.cancelPledge(p.id),
                            child: const Text('Cancel', style: TextStyle(color: AppTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 16),
              ],

              // Urgent Matching Requests Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Matched Emergency Broadcasts',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.slate100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${filteredRequests.length} Active',
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
              else if (filteredRequests.isEmpty)
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
                      const Icon(LucideIcons.checkCircle, size: 36, color: AppTheme.medicalEmerald),
                      const SizedBox(height: 10),
                      const Text(
                        'All Matched Requests Handled',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.slate900),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'No immediate shortages currently reported for $donorGroup blood in your area.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                      ),
                    ],
                  ),
                )
              else
                ...filteredRequests.take(5).map((req) {
                  final isPledged = activePledges.any((p) => p.requestId == req.id);
                  return RequestCard(
                    request: req,
                    isPledged: isPledged,
                    onPledgeTap: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (_) => PledgeModalSheet(
                          request: req,
                          onConfirm: (arrival, notes) async {
                            if (donor != null && auth.user != null) {
                              await donorProvider.submitPledge(
                                requestId: req.id,
                                hospitalId: req.hospitalId,
                                donorId: donor.id,
                                donorUserId: auth.user!.id,
                                donorName: auth.user!.name,
                                donorPhone: donor.phone,
                                bloodGroup: donorGroup,
                                estimatedArrival: arrival,
                                notes: notes,
                              );
                              if (context.mounted) {
                                donorProvider.loadDonorData(
                                  donorId: donor.id,
                                  donorGroup: donorGroup,
                                  donorLat: auth.userLat,
                                  donorLng: auth.userLng,
                                );
                              }
                            }
                          },
                        ),
                      );
                    },
                    onCancelPledgeTap: () {
                      final p = activePledges.firstWhere((item) => item.requestId == req.id);
                      donorProvider.cancelPledge(p.id);
                    },
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}
