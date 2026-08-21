import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/app_icons.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../core/network_client.dart';
import '../../core/distance_engine.dart';
import '../../models/hospital_model.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/blood_group_badge.dart';

class LiveRadarMapScreen extends StatefulWidget {
  const LiveRadarMapScreen({super.key});

  @override
  State<LiveRadarMapScreen> createState() => _LiveRadarMapScreenState();
}

class _LiveRadarMapScreenState extends State<LiveRadarMapScreen> {
  List<HospitalModel> _hospitals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchHospitals();
  }

  Future<void> _fetchHospitals() async {
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();

    try {
      final res = await NetworkClient.get(ApiConfig.hospitalsPublicMap);
      if (res is List) {
        _hospitals = res
            .map((json) => HospitalModel.fromJson(Map<String, dynamic>.from(json)))
            .map((h) {
              final d = DistanceEngine.calculateHaversineDistance(
                auth.userLat,
                auth.userLng,
                h.latitude,
                h.longitude,
              );
              h.distanceKm = d;
              h.estimatedMins = DistanceEngine.calculateTravelTimeMinutes(d, mode: 'emergency');
              return h;
            })
            .toList()
          ..sort((a, b) => (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999));
      }
    } catch (_) {
      // Handled
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worldwide Hospital Radar'),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchHospitals,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _hospitals.isEmpty
                ? const Center(child: Text('No hospitals currently on radar', style: TextStyle(color: AppTheme.slate400)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _hospitals.length,
                    itemBuilder: (ctx, i) {
                      final h = _hospitals[i];
                      final stock = h.bloodStock ?? {};

                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
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
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: AppTheme.medicalBlueLight,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(LucideIcons.building2, color: AppTheme.medicalBlue, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        h.hospitalName,
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppTheme.slate900),
                                      ),
                                      Text(
                                        h.address,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                                      ),
                                    ],
                                  ),
                                ),
                                if (h.distanceKm != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.slate100,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      DistanceEngine.formatDistance(h.distanceKm),
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.slate800),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Blood Stock Grid
                            if (stock.isNotEmpty) ...[
                              const Text('Live Stock in Storage:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.slate600)),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: stock.entries.map((e) {
                                  final isLow = e.value == 0;
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isLow ? AppTheme.primaryRedLight : AppTheme.slate50,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: isLow ? const Color(0xFFFECACA) : AppTheme.slate200),
                                    ),
                                    child: Text(
                                      '${e.key}: ${e.value} U',
                                      style: TextStyle(
                                        color: isLow ? AppTheme.primaryRedDark : AppTheme.slate800,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 12),
                            ],

                            // Actions
                            Row(
                              children: [
                                if (h.emergencyContact.isNotEmpty || h.phone.isNotEmpty)
                                  IconButton(
                                    onPressed: () => launchUrl(Uri.parse('tel:${h.emergencyContact.isNotEmpty ? h.emergencyContact : h.phone}')),
                                    icon: const Icon(LucideIcons.phone, size: 16, color: AppTheme.medicalBlue),
                                    style: IconButton.styleFrom(
                                      backgroundColor: AppTheme.medicalBlueLight,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    tooltip: 'Call Hospital',
                                  ),
                                if (h.latitude != 0 && h.longitude != 0) ...[
                                  const SizedBox(width: 8),
                                  IconButton(
                                    onPressed: () {
                                      final mapUrl = 'https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}';
                                      launchUrl(Uri.parse(mapUrl), mode: LaunchMode.externalApplication);
                                    },
                                    icon: const Icon(LucideIcons.navigation, size: 16, color: AppTheme.slate700),
                                    style: IconButton.styleFrom(
                                      backgroundColor: AppTheme.slate100,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    tooltip: 'Navigate',
                                  ),
                                ],
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
