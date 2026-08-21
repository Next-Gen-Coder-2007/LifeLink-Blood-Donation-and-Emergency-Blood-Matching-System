import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../core/blood_matching_engine.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/blood_group_badge.dart';
import '../donor/donor_main_nav.dart';

class RegisterDonorScreen extends StatefulWidget {
  const RegisterDonorScreen({super.key});

  @override
  State<RegisterDonorScreen> createState() => _RegisterDonorScreenState();
}

class _RegisterDonorScreenState extends State<RegisterDonorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  String _selectedBloodGroup = 'O+';
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    try {
      final auth = context.read<AuthProvider>();
      await auth.registerDonor(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        bloodGroup: _selectedBloodGroup,
        phone: _phoneController.text.trim(),
        address: _addressController.text.trim(),
      );

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const DonorMainNav()),
        (route) => false,
      );
    } catch (err) {
      setState(() => _errorMessage = err.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Volunteer Donor Registration'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_errorMessage != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryRedLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: Text(_errorMessage!, style: const TextStyle(fontSize: 12, color: AppTheme.primaryRedDark, fontWeight: FontWeight.w600)),
                  ),

                // Blood Group Selector
                const Text('Select Your Blood Group', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: BloodMatchingEngine.allBloodGroups.map((bg) {
                    final isSel = _selectedBloodGroup == bg;
                    return BloodGroupBadge(
                      bloodGroup: bg,
                      isLarge: true,
                      isSelected: isSel,
                      onTap: () => setState(() => _selectedBloodGroup = bg),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Name
                const Text('Full Legal Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _nameController,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter your name' : null,
                  decoration: const InputDecoration(hintText: 'John Doe', prefixIcon: Icon(LucideIcons.user, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Email
                const Text('Email Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => (v == null || !v.contains('@')) ? 'Please enter a valid email' : null,
                  decoration: const InputDecoration(hintText: 'john@example.com', prefixIcon: Icon(LucideIcons.mail, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Password
                const Text('Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  validator: (v) => (v == null || v.length < 6) ? 'Password must be at least 6 characters' : null,
                  decoration: const InputDecoration(hintText: '••••••••', prefixIcon: Icon(LucideIcons.lock, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Phone
                const Text('Contact Phone Number', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter your phone number' : null,
                  decoration: const InputDecoration(hintText: '+1 555 123 4567', prefixIcon: Icon(LucideIcons.phone, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Address
                const Text('City / Residential Area', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _addressController,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter your area' : null,
                  decoration: const InputDecoration(hintText: 'New York, NY', prefixIcon: Icon(LucideIcons.mapPin, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 28),

                // Submit
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _handleRegister,
                  child: auth.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Complete Donor Registration'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
