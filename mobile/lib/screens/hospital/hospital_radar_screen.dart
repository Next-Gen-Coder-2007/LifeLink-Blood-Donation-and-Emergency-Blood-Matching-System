import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../core/distance_engine.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../../widgets/blood_group_badge.dart';
import '../../widgets/direct_directive_sheet.dart';

class HospitalRadarScreen extends StatelessWidget {
  const HospitalRadarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final hospProvider = context.watch<HospitalProvider>();
    final hosp = auth.hospitalProfile;
    final donors = hospProvider.nearbyDonors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nearby Donor Locator'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          if (hosp != null) {
            await hospProvider.loadHospitalData(
              hospitalId: hosp.id,
              hospitalLat: hosp.latitude != 0 ? hosp.latitude : auth.userLat,
              hospitalLng: hosp.longitude != 0 ? hosp.longitude : auth.userLng,
            );
          }
        },
        child: donors.isEmpty
            ? const Center(child: Text('No donors found in radar range', style: TextStyle(color: AppTheme.slate400)))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: donors.length,
                itemBuilder: (ctx, i) {
                  final d = donors[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.slate200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            BloodGroupBadge(bloodGroup: d.bloodGroup),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    d.donorName,
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.slate900),
                                  ),
                                  Text(
                                    '${DistanceEngine.formatDistance(d.distanceKm)} (~${d.estimatedMins ?? 15} mins travel)',
                                    style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: d.availability ? AppTheme.medicalEmeraldLight : AppTheme.slate100,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                d.availability ? 'AVAILABLE' : 'RESTING',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  color: d.availability ? AppTheme.medicalEmerald : AppTheme.slate400,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            if (d.phone.isNotEmpty)
                              IconButton(
                                onPressed: () => launchUrl(Uri.parse('tel:${d.phone}')),
                                icon: const Icon(LucideIcons.phone, size: 16, color: AppTheme.medicalBlue),
                                style: IconButton.styleFrom(
                                  backgroundColor: AppTheme.medicalBlueLight,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            const Spacer(),
                            ElevatedButton.icon(
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (_) => DirectDirectiveSheet(
                                    donor: d,
                                    hospitalName: hosp?.hospitalName ?? 'Medical Facility',
                                    onDispatch: (msg, units, urg) async {
                                      if (hosp != null) {
                                        await hospProvider.dispatchDirectDirective(
                                          donorId: d.id,
                                          hospitalId: hosp.id,
                                          message: msg,
                                          unitsNeeded: units,
                                          urgency: urg,
                                        );
                                      }
                                    },
                                  ),
                                );
                              },
                              icon: const Icon(LucideIcons.radio, size: 14),
                              label: const Text('Dispatch Directive', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryRed,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
