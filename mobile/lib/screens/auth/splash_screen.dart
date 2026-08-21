import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../donor/donor_main_nav.dart';
import '../hospital/hospital_main_nav.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;

    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      if (auth.isHospital) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HospitalMainNav()));
      } else {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const DonorMainNav()));
      }
    } else {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 72,
              width: 72,
              decoration: BoxDecoration(
                color: AppTheme.primaryRedLight,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFFECACA), width: 1.5),
              ),
              child: const Center(
                child: Icon(LucideIcons.droplet, color: AppTheme.primaryRed, size: 36),
              ),
            ),
            const SizedBox(height: 18),
            const Text(
              'LifeLink',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: AppTheme.slate900,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Emergency Blood Matching & Donation Network',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppTheme.slate500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
