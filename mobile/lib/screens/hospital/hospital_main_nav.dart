import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../../providers/notification_provider.dart';
import 'hospital_dashboard_screen.dart';
import 'hospital_requests_screen.dart';
import 'hospital_inventory_screen.dart';
import 'hospital_radar_screen.dart';

class HospitalMainNav extends StatefulWidget {
  const HospitalMainNav({super.key});

  @override
  State<HospitalMainNav> createState() => _HospitalMainNavState();
}

class _HospitalMainNavState extends State<HospitalMainNav> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HospitalDashboardScreen(),
    HospitalRequestsScreen(),
    HospitalInventoryScreen(),
    HospitalRadarScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _loadData() {
    final auth = context.read<AuthProvider>();
    final hosp = auth.hospitalProfile;
    if (hosp != null) {
      context.read<HospitalProvider>().loadHospitalData(
            hospitalId: hosp.id,
            hospitalLat: hosp.latitude != 0 ? hosp.latitude : auth.userLat,
            hospitalLng: hosp.longitude != 0 ? hosp.longitude : auth.userLng,
          );
      context.read<NotificationProvider>().fetchNotifications(auth.user!.id, role: 'hospital');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppTheme.slate200, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
          backgroundColor: Colors.white,
          indicatorColor: AppTheme.medicalBlueLight,
          surfaceTintColor: Colors.transparent,
          destinations: const [
            NavigationDestination(
              icon: Icon(LucideIcons.layoutDashboard, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.layoutDashboard, size: 20, color: AppTheme.medicalBlue),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.gitPullRequest, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.gitPullRequest, size: 20, color: AppTheme.medicalBlue),
              label: 'Requests',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.layers, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.layers, size: 20, color: AppTheme.medicalBlue),
              label: 'Blood Bank',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.radar, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.radar, size: 20, color: AppTheme.medicalBlue),
              label: 'Donor Radar',
            ),
          ],
        ),
      ),
    );
  }
}
