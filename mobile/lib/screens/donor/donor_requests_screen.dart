import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../core/blood_matching_engine.dart';
import '../../providers/auth_provider.dart';
import '../../providers/donor_provider.dart';
import '../../widgets/request_card.dart';
import '../../widgets/pledge_modal_sheet.dart';

class DonorRequestsScreen extends StatefulWidget {
  const DonorRequestsScreen({super.key});

  @override
  State<DonorRequestsScreen> createState() => _DonorRequestsScreenState();
}

class _DonorRequestsScreenState extends State<DonorRequestsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  final List<Map<String, String>> _matchModes = [
    {'id': 'compatible', 'label': 'Compatible Matches'},
    {'id': 'exact', 'label': 'Exact Only'},
    {'id': 'urgent', 'label': 'Urgent Emergencies'},
    {'id': 'all', 'label': 'All Broadcasts'},
  ];

  final List<Map<String, dynamic>> _radiusOptions = [
    {'label': '10 km', 'value': 10.0},
    {'label': '25 km', 'value': 25.0},
    {'label': '50 km', 'value': 50.0},
    {'label': 'Any Dist', 'value': 0.0},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final donorProvider = context.watch<DonorProvider>();
    final donor = auth.donorProfile;
    final donorGroup = donor?.bloodGroup ?? auth.user?.bloodGroup ?? 'O+';

    final filtered = donorProvider.getFilteredRequests(donorGroup).where((r) {
      if (_searchQuery.trim().isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return r.hospitalName.toLowerCase().contains(q) ||
          r.hospitalAddress.toLowerCase().contains(q) ||
          r.bloodGroup.toLowerCase().contains(q);
    }).toList();

    final activePledges = donorProvider.pledges.where((p) => p.status == 'pledged' || p.status == 'acknowledged').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Matching Center'),
      ),
      body: Column(
        children: [
          // Filter Toolbar Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: AppTheme.slate200)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Field
                TextField(
                  controller: _searchController,
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'Search hospital, address, or type...',
                    prefixIcon: const Icon(LucideIcons.search, size: 16, color: AppTheme.slate400),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(LucideIcons.x, size: 14),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 10),

                // Match Mode Tabs
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _matchModes.map((m) {
                      final isSel = donorProvider.filterMode == m['id'];
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ChoiceChip(
                          label: Text(m['label']!),
                          selected: isSel,
                          onSelected: (_) => donorProvider.setFilterMode(m['id']!),
                          selectedColor: AppTheme.slate900,
                          backgroundColor: AppTheme.slate50,
                          labelStyle: TextStyle(
                            color: isSel ? Colors.white : AppTheme.slate700,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                          side: BorderSide(color: isSel ? AppTheme.slate900 : AppTheme.slate200),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 8),

                // Blood Group Selectors Row & Radius Row
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ActionChip(
                          label: const Text('ALL'),
                          onPressed: () => donorProvider.setBloodGroupFilter('ALL'),
                          backgroundColor: donorProvider.bloodGroupFilter == 'ALL' ? AppTheme.primaryRed : AppTheme.slate50,
                          labelStyle: TextStyle(
                            color: donorProvider.bloodGroupFilter == 'ALL' ? Colors.white : AppTheme.slate700,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                          side: BorderSide(color: donorProvider.bloodGroupFilter == 'ALL' ? AppTheme.primaryRed : AppTheme.slate200),
                        ),
                      ),
                      ...BloodMatchingEngine.allBloodGroups.map((bg) {
                        final isSel = donorProvider.bloodGroupFilter == bg;
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ActionChip(
                            label: Text(bg),
                            onPressed: () => donorProvider.setBloodGroupFilter(bg),
                            backgroundColor: isSel ? AppTheme.primaryRed : AppTheme.slate50,
                            labelStyle: TextStyle(
                              color: isSel ? Colors.white : AppTheme.slate700,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                            side: BorderSide(color: isSel ? AppTheme.primaryRed : AppTheme.slate200),
                          ),
                        );
                      }),
                      const SizedBox(width: 8),
                      // Radius Filters
                      ..._radiusOptions.map((rad) {
                        final isSel = donorProvider.radiusFilter == rad['value'];
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            label: Text(rad['label']),
                            selected: isSel,
                            onSelected: (_) => donorProvider.setRadiusFilter(rad['value']),
                            selectedColor: AppTheme.medicalBlue,
                            backgroundColor: AppTheme.slate50,
                            labelStyle: TextStyle(
                              color: isSel ? Colors.white : AppTheme.slate700,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                            side: BorderSide(color: isSel ? AppTheme.medicalBlue : AppTheme.slate200),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Request List Stream
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => donorProvider.loadDonorData(
                donorId: donor?.id,
                donorGroup: donorGroup,
                donorLat: auth.userLat,
                donorLng: auth.userLng,
              ),
              child: donorProvider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filtered.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(LucideIcons.droplets, size: 48, color: AppTheme.slate300),
                                const SizedBox(height: 12),
                                const Text(
                                  'No Requests Found',
                                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.slate900),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'No active broadcasts match your current filters. Tap "All Broadcasts" or change your distance radius.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, i) {
                            final req = filtered[i];
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
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
