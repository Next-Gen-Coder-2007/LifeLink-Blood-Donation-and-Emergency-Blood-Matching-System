import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../../widgets/blood_group_badge.dart';
import '../../widgets/urgency_pill.dart';
import 'create_request_screen.dart';

class HospitalRequestsScreen extends StatefulWidget {
  const HospitalRequestsScreen({super.key});

  @override
  State<HospitalRequestsScreen> createState() => _HospitalRequestsScreenState();
}

class _HospitalRequestsScreenState extends State<HospitalRequestsScreen> {
  String _filterStatus = 'all';

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final hospProvider = context.watch<HospitalProvider>();
    final hosp = auth.hospitalProfile;

    final allReqs = hospProvider.hospitalRequests;
    final filtered = allReqs.where((r) {
      if (_filterStatus == 'searching') return r.status == 'searching';
      if (_filterStatus == 'fulfilled') return r.status == 'fulfilled' || r.status == 'completed';
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hospital Broadcasts'),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateRequestScreen()));
            },
            icon: const Icon(LucideIcons.plusCircle, color: AppTheme.primaryRed),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: AppTheme.slate200)),
            ),
            child: Row(
              children: [
                _buildFilterChip('all', 'All (${allReqs.length})'),
                const SizedBox(width: 8),
                _buildFilterChip('searching', 'Active Broadcasts'),
                const SizedBox(width: 8),
                _buildFilterChip('fulfilled', 'Fulfilled'),
              ],
            ),
          ),

          // Request List
          Expanded(
            child: RefreshIndicator(
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
              child: filtered.isEmpty
                  ? const Center(child: Text('No requests found', style: TextStyle(color: AppTheme.slate400)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      itemBuilder: (ctx, i) {
                        final req = filtered[i];
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
                                  UrgencyPill(urgency: req.urgency),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: req.status == 'searching' ? AppTheme.primaryRedLight : AppTheme.medicalEmeraldLight,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      req.status.toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: req.status == 'searching' ? AppTheme.primaryRedDark : const Color(0xFF065F46),
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  BloodGroupBadge(bloodGroup: req.bloodGroup),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                '${req.unitsRequired} Units Required',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.slate900),
                              ),
                              if (req.patientName != null) ...[
                                const SizedBox(height: 2),
                                Text('Patient: ${req.patientName}', style: const TextStyle(fontSize: 12, color: AppTheme.slate500)),
                              ],
                              const SizedBox(height: 12),
                              if (req.status == 'searching')
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      hospProvider.fulfillRequest(req.id);
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.medicalEmerald,
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                    ),
                                    child: const Text('Mark Request Fulfilled', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String id, String label) {
    final isSel = _filterStatus == id;
    return ChoiceChip(
      label: Text(label),
      selected: isSel,
      onSelected: (_) => setState(() => _filterStatus = id),
      selectedColor: AppTheme.slate900,
      backgroundColor: AppTheme.slate50,
      labelStyle: TextStyle(color: isSel ? Colors.white : AppTheme.slate700, fontSize: 11, fontWeight: FontWeight.w800),
      side: BorderSide(color: isSel ? AppTheme.slate900 : AppTheme.slate200),
    );
  }
}
