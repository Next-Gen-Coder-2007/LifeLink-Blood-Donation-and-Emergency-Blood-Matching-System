import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/donor_provider.dart';
import '../../providers/notification_provider.dart';
import '../common/notifications_screen.dart';
import 'donor_dashboard_screen.dart';
import 'donor_requests_screen.dart';
import 'donor_history_screen.dart';
import 'donor_profile_screen.dart';

class DonorMainNav extends StatefulWidget {
  const DonorMainNav({super.key});

  @override
  State<DonorMainNav> createState() => _DonorMainNavState();
}

class _DonorMainNavState extends State<DonorMainNav> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DonorDashboardScreen(),
    DonorRequestsScreen(),
    DonorHistoryScreen(),
    DonorProfileScreen(),
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
    final donor = auth.donorProfile;
    context.read<DonorProvider>().loadDonorData(
          donorId: donor?.id,
          donorGroup: donor?.bloodGroup ?? 'O+',
          donorLat: auth.userLat,
          donorLng: auth.userLng,
        );
    if (auth.user != null) {
      context.read<NotificationProvider>().fetchNotifications(auth.user!.id, role: 'donor');
    }
  }

  @override
  Widget build(BuildContext context) {
    final notifProvider = context.watch<NotificationProvider>();
    final unread = notifProvider.unreadCount;

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
          indicatorColor: AppTheme.primaryRedLight,
          surfaceTintColor: Colors.transparent,
          destinations: const [
            NavigationDestination(
              icon: Icon(LucideIcons.layoutDashboard, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.layoutDashboard, size: 20, color: AppTheme.primaryRed),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.droplet, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.droplet, size: 20, color: AppTheme.primaryRed),
              label: 'Matching',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.award, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.award, size: 20, color: AppTheme.primaryRed),
              label: 'Certificates',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.user, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.user, size: 20, color: AppTheme.primaryRed),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
