import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../donor/donor_main_nav.dart';
import '../hospital/hospital_main_nav.dart';
import 'register_donor_screen.dart';
import 'register_hospital_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    try {
      final auth = context.read<AuthProvider>();
      await auth.login(_emailController.text.trim(), _passwordController.text);

      if (!mounted) return;
      if (auth.isHospital) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HospitalMainNav()));
      } else {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const DonorMainNav()));
      }
    } catch (err) {
      setState(() => _errorMessage = err.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Center(
                    child: Container(
                      height: 64,
                      width: 64,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryRed.withValues(alpha: 0.2),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: Image.asset(
                          'assets/icon/app_logo.png',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppTheme.primaryRedLight,
                            child: const Center(
                              child: Icon(LucideIcons.droplet, color: AppTheme.primaryRed, size: 28),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Welcome to LifeLink',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.slate900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Sign in to access your blood matching dashboard',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: AppTheme.slate500),
                  ),
                  const SizedBox(height: 28),

                  if (_errorMessage != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryRedLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.alertCircle, size: 16, color: AppTheme.primaryRed),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(fontSize: 12, color: AppTheme.primaryRedDark, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Email
                  const Text('Email Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => (v == null || !v.contains('@')) ? 'Please enter a valid email' : null,
                    decoration: const InputDecoration(
                      hintText: 'name@example.com',
                      prefixIcon: Icon(LucideIcons.mail, size: 16, color: AppTheme.slate400),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Password
                  const Text('Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    validator: (v) => (v == null || v.isEmpty) ? 'Please enter your password' : null,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      prefixIcon: const Icon(LucideIcons.lock, size: 16, color: AppTheme.slate400),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye, size: 16, color: AppTheme.slate400),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Submit
                  ElevatedButton(
                    onPressed: auth.isLoading ? null : _handleLogin,
                    child: auth.isLoading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Sign In to Account'),
                  ),
                  const SizedBox(height: 24),

                  // Register Options
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? ", style: TextStyle(color: AppTheme.slate500, fontSize: 13)),
                      InkWell(
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterDonorScreen()));
                        },
                        child: const Text('Join as Donor', style: TextStyle(color: AppTheme.primaryRed, fontWeight: FontWeight.w800, fontSize: 13)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: InkWell(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterHospitalScreen()));
                      },
                      child: const Text('Register Medical Facility →', style: TextStyle(color: AppTheme.medicalBlue, fontWeight: FontWeight.w700, fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
