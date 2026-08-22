import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../auth/login_screen.dart';

class HospitalSettingsScreen extends StatefulWidget {
  const HospitalSettingsScreen({super.key});

  @override
  State<HospitalSettingsScreen> createState() => _HospitalSettingsScreenState();
}

class _HospitalSettingsScreenState extends State<HospitalSettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _emergencyController;
  late TextEditingController _addressController;
  late TextEditingController _passwordController;

  bool _isSaving = false;
  bool _isInitialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final auth = context.read<AuthProvider>();
      final user = auth.user;
      final hosp = auth.hospitalProfile;

      _nameController = TextEditingController(text: hosp?.hospitalName ?? user?.name ?? '');
      _emailController = TextEditingController(text: user?.email ?? '');
      _phoneController = TextEditingController(text: hosp?.phone ?? '');
      _emergencyController = TextEditingController(text: hosp?.emergencyContact ?? '');
      _addressController = TextEditingController(text: hosp?.address ?? '');
      _passwordController = TextEditingController();

      _isInitialized = true;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _emergencyController.dispose();
    _addressController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final auth = context.read<AuthProvider>();
    final hospProvider = context.read<HospitalProvider>();

    try {
      // 1. Update user account details (name, email, password)
      await auth.updateUserProfile(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text.trim().isNotEmpty ? _passwordController.text.trim() : null,
      );

      // 2. Update hospital facility details
      await auth.updateHospitalProfile(
        hospitalName: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        emergencyContact: _emergencyController.text.trim(),
        address: _addressController.text.trim(),
      );

      // 3. Reload hospital data
      final hospId = auth.hospitalProfile?.id ?? auth.user?.profileId;
      if (hospId != null && hospId.isNotEmpty) {
        await hospProvider.loadHospitalData(
          hospitalId: hospId,
          hospitalLat: auth.hospitalProfile?.latitude ?? auth.userLat,
          hospitalLng: auth.hospitalProfile?.longitude ?? auth.userLng,
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Hospital facility settings updated successfully!'),
          backgroundColor: AppTheme.medicalEmerald,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      _passwordController.clear();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update hospital settings: $e'),
          backgroundColor: AppTheme.primaryRed,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(LucideIcons.logOut, color: AppTheme.primaryRed, size: 22),
            SizedBox(width: 10),
            Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        ),
        content: const Text(
          'Are you sure you want to sign out from the Hospital Command Portal?',
          style: TextStyle(color: AppTheme.slate600, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.slate500, fontWeight: FontWeight.w700)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final auth = context.read<AuthProvider>();
              final nav = Navigator.of(context);
              await auth.logout();
              nav.pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryRed,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final hosp = auth.hospitalProfile;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hospital Facility Settings'),
        actions: [
          IconButton(
            onPressed: _confirmLogout,
            icon: const Icon(LucideIcons.logOut, color: AppTheme.primaryRed, size: 20),
            tooltip: 'Sign Out',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hospital Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Column(
                  children: [
                    Container(
                      height: 64,
                      width: 64,
                      decoration: BoxDecoration(
                        color: AppTheme.medicalBlueLight,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(LucideIcons.building, size: 32, color: AppTheme.medicalBlue),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      hosp?.hospitalName ?? user?.name ?? 'Medical Facility',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      user?.email ?? '',
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.medicalBlueLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'REGISTERED MEDICAL CENTER',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.medicalBlue),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Section 1: Medical Facility Details
              const Text(
                'Facility & Triage Information',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
              ),
              const SizedBox(height: 10),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Column(
                  children: [
                    // Facility Name Field
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Facility / Hospital Name',
                        prefixIcon: Icon(LucideIcons.building, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter hospital name' : null,
                    ),
                    const SizedBox(height: 14),

                    // Hotline Phone
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Hospital Hotline Phone',
                        prefixIcon: Icon(LucideIcons.phone, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter hotline phone' : null,
                    ),
                    const SizedBox(height: 14),

                    // Emergency Triage Contact
                    TextFormField(
                      controller: _emergencyController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: '24/7 Emergency Triage Contact',
                        prefixIcon: Icon(LucideIcons.phoneCall, size: 18, color: AppTheme.primaryRed),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter emergency triage contact' : null,
                    ),
                    const SizedBox(height: 14),

                    // Physical Address
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        labelText: 'Physical Facility Address',
                        prefixIcon: Icon(LucideIcons.mapPin, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter hospital address' : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Section 2: Account & Security
              const Text(
                'Account Credentials & Security',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
              ),
              const SizedBox(height: 10),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Column(
                  children: [
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Portal Login Email',
                        prefixIcon: Icon(LucideIcons.mail, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) => (v == null || !v.contains('@')) ? 'Please enter a valid email' : null,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Change Password (Optional)',
                        hintText: 'Leave blank to keep current password',
                        prefixIcon: Icon(LucideIcons.lock, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) {
                        if (v != null && v.isNotEmpty && v.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Save Changes Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSaving ? null : _handleSave,
                  icon: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(LucideIcons.save, size: 18),
                  label: Text(
                    _isSaving ? 'Saving Changes...' : 'Save Hospital Settings',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.medicalBlue,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Sign Out Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _confirmLogout,
                  icon: const Icon(LucideIcons.logOut, size: 16, color: AppTheme.primaryRed),
                  label: const Text('Sign Out from Hospital Portal', style: TextStyle(color: AppTheme.primaryRed, fontWeight: FontWeight.w800)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFECACA)),
                    backgroundColor: AppTheme.primaryRedLight,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
