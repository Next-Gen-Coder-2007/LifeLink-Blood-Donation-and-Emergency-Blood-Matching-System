import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../core/blood_matching_engine.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/blood_group_badge.dart';
import '../auth/login_screen.dart';

class DonorProfileScreen extends StatefulWidget {
  const DonorProfileScreen({super.key});

  @override
  State<DonorProfileScreen> createState() => _DonorProfileScreenState();
}

class _DonorProfileScreenState extends State<DonorProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _lastDonationController;
  late TextEditingController _passwordController;

  String _selectedBloodGroup = 'O+';
  bool _availability = true;
  bool _isSaving = false;
  bool _isInitialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final auth = context.read<AuthProvider>();
      final user = auth.user;
      final donor = auth.donorProfile;

      _selectedBloodGroup = donor?.bloodGroup ?? user?.bloodGroup ?? 'O+';
      _availability = donor?.availability ?? true;

      _nameController = TextEditingController(text: donor?.donorName ?? user?.name ?? '');
      _emailController = TextEditingController(text: user?.email ?? '');
      _phoneController = TextEditingController(text: donor?.phone ?? '');
      _addressController = TextEditingController(text: donor?.address ?? '');
      _lastDonationController = TextEditingController(text: donor?.lastDonationDate ?? '');
      _passwordController = TextEditingController();

      _isInitialized = true;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _lastDonationController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final auth = context.read<AuthProvider>();
    try {
      // 1. Update user account details (name, email, password)
      await auth.updateUserProfile(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text.trim().isNotEmpty ? _passwordController.text.trim() : null,
      );

      // 2. Update donor profile details
      await auth.updateDonorProfile(
        phone: _phoneController.text.trim(),
        bloodGroup: _selectedBloodGroup,
        address: _addressController.text.trim(),
        availability: _availability,
        lastDonationDate: _lastDonationController.text.trim().isNotEmpty ? _lastDonationController.text.trim() : null,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Profile and settings updated successfully!'),
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
          content: Text('Failed to update profile: $e'),
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
          'Are you sure you want to sign out from your LifeLink donor account?',
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Donor Settings & Profile'),
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
              // Avatar & Header Card
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
                    CircleAvatar(
                      radius: 34,
                      backgroundColor: AppTheme.primaryRedLight,
                      child: Text(
                        (user?.name.isNotEmpty == true ? user!.name.substring(0, 1) : 'D').toUpperCase(),
                        style: const TextStyle(
                          color: AppTheme.primaryRed,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      user?.name ?? 'Volunteer Donor',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      user?.email ?? '',
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                    ),
                    const SizedBox(height: 12),
                    BloodGroupBadge(bloodGroup: _selectedBloodGroup, isLarge: true),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Section 1: Donor & Medical Profile
              const Text(
                'Donor & Contact Information',
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Full Name Field
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Full Name',
                        prefixIcon: Icon(LucideIcons.user, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                    ),
                    const SizedBox(height: 14),

                    // Phone Field
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Phone Number',
                        prefixIcon: Icon(LucideIcons.phone, size: 18, color: AppTheme.slate400),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter phone number' : null,
                    ),
                    const SizedBox(height: 14),

                    // Blood Group Selector
                    DropdownButtonFormField<String>(
                      initialValue: BloodMatchingEngine.allBloodGroups.contains(_selectedBloodGroup)
                          ? _selectedBloodGroup
                          : 'O+',
                      decoration: const InputDecoration(
                        labelText: 'Blood Group Type',
                        prefixIcon: Icon(LucideIcons.droplet, size: 18, color: AppTheme.primaryRed),
                      ),
                      items: BloodMatchingEngine.allBloodGroups.map((bg) {
                        return DropdownMenuItem(
                          value: bg,
                          child: Text(
                            '$bg Blood Group',
                            style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.slate900),
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedBloodGroup = val);
                      },
                    ),
                    const SizedBox(height: 14),

                    // Address Field
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        labelText: 'Address / City Area',
                        prefixIcon: Icon(LucideIcons.mapPin, size: 18, color: AppTheme.slate400),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Last Donation Date
                    TextFormField(
                      controller: _lastDonationController,
                      readOnly: true,
                      decoration: const InputDecoration(
                        labelText: 'Last Donated Date (YYYY-MM-DD)',
                        prefixIcon: Icon(LucideIcons.calendar, size: 18, color: AppTheme.slate400),
                      ),
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime.now(),
                        );
                        if (picked != null) {
                          _lastDonationController.text =
                              "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                        }
                      },
                    ),
                    const SizedBox(height: 16),

                    // Availability Toggle
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: _availability ? AppTheme.medicalEmeraldLight : AppTheme.slate50,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _availability ? const Color(0xFFA7F3D0) : AppTheme.slate200),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            LucideIcons.activity,
                            size: 20,
                            color: _availability ? AppTheme.medicalEmerald : AppTheme.slate400,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Ready to Donate',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    color: _availability ? AppTheme.medicalEmerald : AppTheme.slate700,
                                  ),
                                ),
                                const Text(
                                  'Appear on hospital emergency matching radar',
                                  style: TextStyle(fontSize: 11, color: AppTheme.slate500),
                                ),
                              ],
                            ),
                          ),
                          Switch(
                            value: _availability,
                            activeTrackColor: AppTheme.medicalEmerald,
                            activeThumbColor: Colors.white,
                            onChanged: (val) => setState(() => _availability = val),
                          ),
                        ],
                      ),
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
                        labelText: 'Login Email Address',
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
                    _isSaving ? 'Saving Changes...' : 'Save Profile & Settings',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryRed,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Logout Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _confirmLogout,
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
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
