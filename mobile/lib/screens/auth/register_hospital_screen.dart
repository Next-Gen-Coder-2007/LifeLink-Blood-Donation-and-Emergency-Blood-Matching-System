import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../hospital/hospital_main_nav.dart';

class RegisterHospitalScreen extends StatefulWidget {
  const RegisterHospitalScreen({super.key});

  @override
  State<RegisterHospitalScreen> createState() => _RegisterHospitalScreenState();
}

class _RegisterHospitalScreenState extends State<RegisterHospitalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emergencyController = TextEditingController();
  final _addressController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _emergencyController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    try {
      final auth = context.read<AuthProvider>();
      await auth.registerHospital(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        phone: _phoneController.text.trim(),
        emergencyContact: _emergencyController.text.trim(),
        address: _addressController.text.trim(),
      );

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HospitalMainNav()),
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
        title: const Text('Medical Facility Registration'),
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

                // Facility Name
                const Text('Hospital / Facility Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _nameController,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter facility name' : null,
                  decoration: const InputDecoration(hintText: 'Metro General Hospital', prefixIcon: Icon(LucideIcons.building2, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Email
                const Text('Official Email Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => (v == null || !v.contains('@')) ? 'Please enter a valid email' : null,
                  decoration: const InputDecoration(hintText: 'admin@metrohospital.org', prefixIcon: Icon(LucideIcons.mail, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Password
                const Text('Account Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  validator: (v) => (v == null || v.length < 6) ? 'Password must be at least 6 characters' : null,
                  decoration: const InputDecoration(hintText: '••••••••', prefixIcon: Icon(LucideIcons.lock, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Phone
                const Text('General Phone', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter facility phone' : null,
                  decoration: const InputDecoration(hintText: '+1 555 234 5678', prefixIcon: Icon(LucideIcons.phone, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Emergency Contact Hotline
                const Text('Emergency Blood Bank Desk Hotline', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _emergencyController,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter emergency hotline' : null,
                  decoration: const InputDecoration(hintText: '+1 555 911 0000', prefixIcon: Icon(LucideIcons.phoneCall, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 16),

                // Address
                const Text('Hospital Physical Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _addressController,
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter address' : null,
                  decoration: const InputDecoration(hintText: '123 Medical Plaza, New York, NY', prefixIcon: Icon(LucideIcons.mapPin, size: 16, color: AppTheme.slate400)),
                ),
                const SizedBox(height: 28),

                // Submit
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.medicalBlue),
                  child: auth.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Register Medical Facility'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
