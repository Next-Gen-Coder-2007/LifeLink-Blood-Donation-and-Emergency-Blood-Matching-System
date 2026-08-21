import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/blood_group_badge.dart';
import '../auth/login_screen.dart';

class DonorProfileScreen extends StatelessWidget {
  const DonorProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final donor = auth.donorProfile;
    final donorGroup = donor?.bloodGroup ?? user?.bloodGroup ?? 'O+';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Donor Profile & Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile Card Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppTheme.primaryRedLight,
                    child: Text(
                      donor?.donorName.substring(0, 1).toUpperCase() ?? 'D',
                      style: const TextStyle(
                        color: AppTheme.primaryRed,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    donor?.donorName ?? user?.name ?? 'Volunteer Donor',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                  ),
                  const SizedBox(height: 12),
                  BloodGroupBadge(bloodGroup: donorGroup, isLarge: true),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Donor Details Dossier
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Column(
                children: [
                  _buildDetailRow(LucideIcons.phone, 'Contact Phone', donor?.phone ?? 'Not specified'),
                  const Divider(),
                  _buildDetailRow(LucideIcons.mapPin, 'Address / Area', donor?.address ?? 'Not specified'),
                  const Divider(),
                  _buildDetailRow(
                    LucideIcons.activity,
                    'Current Availability',
                    donor?.availability == true ? 'Active & Ready to Donate' : 'Marked Resting',
                  ),
                  const Divider(),
                  _buildDetailRow(
                    LucideIcons.calendar,
                    'Last Donated Date',
                    donor?.lastDonationDate ?? 'First-Time Donor',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
                icon: const Icon(LucideIcons.logOut, size: 16, color: AppTheme.primaryRed),
                label: const Text('Sign Out from LifeLink', style: TextStyle(color: AppTheme.primaryRed, fontWeight: FontWeight.w800)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFFECACA)),
                  backgroundColor: AppTheme.primaryRedLight,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.slate400),
          const SizedBox(width: 12),
          Text(title, style: const TextStyle(fontSize: 13, color: AppTheme.slate600, fontWeight: FontWeight.w600)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, color: AppTheme.slate900, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}
