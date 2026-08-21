import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_icons.dart';
import '../config/theme.dart';
import '../core/distance_engine.dart';
import '../models/blood_request_model.dart';
import 'blood_group_badge.dart';
import 'urgency_pill.dart';

class RequestCard extends StatelessWidget {
  final BloodRequestModel request;
  final bool isPledged;
  final String? pledgeStatus;
  final VoidCallback? onPledgeTap;
  final VoidCallback? onCancelPledgeTap;

  const RequestCard({
    super.key,
    required this.request,
    this.isPledged = false,
    this.pledgeStatus,
    this.onPledgeTap,
    this.onCancelPledgeTap,
  });

  @override
  Widget build(BuildContext context) {
    final hotline = request.emergencyContact.isNotEmpty
        ? request.emergencyContact
        : request.hospitalPhone;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isPledged ? const Color(0xFFF0FDF4) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isPledged ? const Color(0xFF86EFAC) : AppTheme.slate200,
          width: isPledged ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Badges & Target Group
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              UrgencyPill(urgency: request.urgency),
              const SizedBox(width: 8),
              if (request.matchLabel != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.medicalBlueLight,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                  ),
                  child: Text(
                    request.matchLabel!,
                    style: const TextStyle(
                      color: AppTheme.medicalBlue,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              const Spacer(),
              BloodGroupBadge(bloodGroup: request.bloodGroup),
            ],
          ),
          const SizedBox(height: 10),

          // Hospital Name & Needed Units
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  request.hospitalName,
                  style: const TextStyle(
                    color: AppTheme.slate900,
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
              ),
              Text(
                '${request.unitsRequired} Units',
                style: const TextStyle(
                  color: AppTheme.primaryRed,
                  fontWeight: FontWeight.w900,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Address & Proximity
          Row(
            children: [
              const Icon(LucideIcons.mapPin, size: 12, color: AppTheme.slate400),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  request.hospitalAddress,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppTheme.slate500, fontSize: 12),
                ),
              ),
              if (request.distanceKm != null) ...[
                const SizedBox(width: 6),
                Text(
                  '• ${DistanceEngine.formatDistance(request.distanceKm)} (${DistanceEngine.formatTravelTime(request.estimatedMins)})',
                  style: const TextStyle(
                    color: AppTheme.slate700,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 14),

          // Action Buttons
          Row(
            children: [
              if (hotline.isNotEmpty)
                IconButton(
                  onPressed: () => launchUrl(Uri.parse('tel:$hotline')),
                  icon: const Icon(LucideIcons.phoneCall, size: 16, color: AppTheme.medicalBlue),
                  style: IconButton.styleFrom(
                    backgroundColor: AppTheme.medicalBlueLight,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  tooltip: 'Call Hotline',
                ),
              if (request.hospitalLatitude != 0 && request.hospitalLongitude != 0) ...[
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () {
                    final mapUrl = 'https://www.google.com/maps/dir/?api=1&destination=${request.hospitalLatitude},${request.hospitalLongitude}';
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
              const Spacer(),
              if (isPledged)
                OutlinedButton.icon(
                  onPressed: onCancelPledgeTap,
                  icon: const Icon(LucideIcons.x, size: 14, color: AppTheme.primaryRed),
                  label: const Text('Cancel Pledge', style: TextStyle(color: AppTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.w700)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFECACA)),
                    backgroundColor: AppTheme.primaryRedLight,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                )
              else
                ElevatedButton.icon(
                  onPressed: onPledgeTap,
                  icon: const Icon(LucideIcons.heartHandshake, size: 14),
                  label: const Text('Pledge Blood', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryRed,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
