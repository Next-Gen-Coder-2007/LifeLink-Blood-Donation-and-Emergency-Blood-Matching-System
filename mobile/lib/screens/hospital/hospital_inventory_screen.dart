import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../core/blood_matching_engine.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../../widgets/blood_group_badge.dart';

class HospitalInventoryScreen extends StatelessWidget {
  const HospitalInventoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final hospProvider = context.watch<HospitalProvider>();
    final hosp = auth.hospitalProfile;
    final inv = hospProvider.inventory;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Blood Bank Storage'),
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
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Total Storage Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.medicalEmeraldLight,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(LucideIcons.layers, color: AppTheme.medicalEmerald, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Total Refrigerated Reserves',
                            style: TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${hospProvider.totalStockUnits} Units in Bank',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Storage Reserves by Blood Group',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
              ),
              const SizedBox(height: 12),

              // Blood Groups Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                ),
                itemCount: BloodMatchingEngine.allBloodGroups.length,
                itemBuilder: (ctx, i) {
                  final bg = BloodMatchingEngine.allBloodGroups[i];
                  final units = inv[bg] ?? 0;
                  final isLow = units < 3;
                  final hospId = hosp?.id ?? auth.user?.profileId;

                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isLow ? const Color(0xFFFECACA) : AppTheme.slate200,
                        width: isLow ? 1.5 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            BloodGroupBadge(bloodGroup: bg),
                            if (isLow)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryRedLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text('LOW', style: TextStyle(color: AppTheme.primaryRed, fontSize: 9, fontWeight: FontWeight.w900)),
                              ),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '$units Units',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.slate900),
                            ),
                            Row(
                              children: [
                                InkWell(
                                  onTap: () {
                                    if (hospId != null && hospId.isNotEmpty && units > 0) {
                                      hospProvider.updateInventoryUnit(
                                        hospitalId: hospId,
                                        bloodGroup: bg,
                                        newUnits: units - 1,
                                      );
                                    }
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(color: AppTheme.slate100, borderRadius: BorderRadius.circular(6)),
                                    child: const Icon(LucideIcons.minus, size: 12),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                InkWell(
                                  onTap: () {
                                    if (hospId != null && hospId.isNotEmpty) {
                                      hospProvider.updateInventoryUnit(
                                        hospitalId: hospId,
                                        bloodGroup: bg,
                                        newUnits: units + 1,
                                      );
                                    }
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(color: AppTheme.slate100, borderRadius: BorderRadius.circular(6)),
                                    child: const Icon(LucideIcons.plus, size: 12),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
