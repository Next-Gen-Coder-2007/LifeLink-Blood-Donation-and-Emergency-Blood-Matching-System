import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/donor_provider.dart';
import '../../providers/notification_provider.dart';
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
  String? _loadedDonorId;

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

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = Provider.of<AuthProvider>(context);
    final donorId = auth.donorProfile?.id ?? auth.user?.profileId;
    if (donorId != null && donorId.isNotEmpty && donorId != _loadedDonorId) {
      _loadData();
    }
  }

  @override
  void dispose() {
    final notifProvider = context.read<NotificationProvider>();
    notifProvider.stopPolling();
    super.dispose();
  }

  void _loadData() {
    final auth = context.read<AuthProvider>();
    final donor = auth.donorProfile;
    final donorId = donor?.id ?? auth.user?.profileId;
    final donorGroup = donor?.bloodGroup ?? auth.user?.bloodGroup ?? 'O+';
    final userId = auth.user?.id;

    _loadedDonorId = donorId;

    context.read<DonorProvider>().loadDonorData(
          donorId: donorId,
          donorGroup: donorGroup,
          donorLat: auth.userLat,
          donorLng: auth.userLng,
        );

    if (userId != null && userId.isNotEmpty) {
      context.read<NotificationProvider>().startPolling(userId, role: 'donor');
    }
  }

  @override
  Widget build(BuildContext context) {
    final donorProvider = context.watch<DonorProvider>();
    final notifProvider = context.watch<NotificationProvider>();
    final activePledgesCount = donorProvider.pledges
        .where((p) => p.status == 'pledged' || p.status == 'acknowledged')
        .length;

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
          destinations: [
            const NavigationDestination(
              icon: Icon(LucideIcons.layoutDashboard, size: 20, color: AppTheme.slate500),
              selectedIcon: Icon(LucideIcons.layoutDashboard, size: 20, color: AppTheme.primaryRed),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: activePledgesCount > 0,
                label: Text('$activePledgesCount', style: const TextStyle(fontSize: 10)),
                backgroundColor: AppTheme.medicalBlue,
                child: const Icon(LucideIcons.droplet, size: 20, color: AppTheme.slate500),
              ),
              selectedIcon: const Icon(LucideIcons.droplet, size: 20, color: AppTheme.primaryRed),
              label: 'Matching',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: donorProvider.history.isNotEmpty,
                label: Text('${donorProvider.history.length}', style: const TextStyle(fontSize: 10)),
                backgroundColor: AppTheme.medicalEmerald,
                child: const Icon(LucideIcons.award, size: 20, color: AppTheme.slate500),
              ),
              selectedIcon: const Icon(LucideIcons.award, size: 20, color: AppTheme.primaryRed),
              label: 'Certificates',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: notifProvider.unreadCount > 0,
                label: Text('${notifProvider.unreadCount}', style: const TextStyle(fontSize: 10)),
                backgroundColor: AppTheme.primaryRed,
                child: const Icon(LucideIcons.user, size: 20, color: AppTheme.slate500),
              ),
              selectedIcon: const Icon(LucideIcons.user, size: 20, color: AppTheme.primaryRed),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
