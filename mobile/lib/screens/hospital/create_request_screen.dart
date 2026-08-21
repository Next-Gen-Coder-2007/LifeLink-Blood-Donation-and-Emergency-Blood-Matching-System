import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_icons.dart';
import '../../config/theme.dart';
import '../../core/blood_matching_engine.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';
import '../../widgets/blood_group_badge.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedBloodGroup = 'O+';
  int _units = 2;
  String _urgency = 'emergency';
  final _patientController = TextEditingController();
  final _requiredByController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _patientController.dispose();
    _requiredByController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final auth = context.read<AuthProvider>();
    final hospProvider = context.read<HospitalProvider>();
    final hosp = auth.hospitalProfile;

    if (hosp == null) return;
    setState(() => _isSubmitting = true);

    try {
      await hospProvider.createBloodRequest(
        hospitalId: hosp.id,
        bloodGroup: _selectedBloodGroup,
        unitsRequired: _units,
        urgency: _urgency,
        patientName: _patientController.text.trim().isNotEmpty ? _patientController.text.trim() : null,
        requiredBy: _requiredByController.text.trim().isNotEmpty ? _requiredByController.text.trim() : null,
      );

      await hospProvider.loadHospitalData(
        hospitalId: hosp.id,
        hospitalLat: hosp.latitude != 0 ? hosp.latitude : auth.userLat,
        hospitalLng: hosp.longitude != 0 ? hosp.longitude : auth.userLng,
      );

      if (!mounted) return;
      Navigator.pop(context);
    } catch (_) {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Broadcast Blood Need'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Blood Group Selection
              const Text('Target Blood Type Required', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
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

              // Urgency Tier
              const Text('Clinical Urgency Tier', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildUrgencyChoice('emergency', 'Critical Emergency', AppTheme.primaryRed),
                  const SizedBox(width: 8),
                  _buildUrgencyChoice('urgent', 'Urgent (2 Hrs)', AppTheme.medicalAmber),
                  const SizedBox(width: 8),
                  _buildUrgencyChoice('normal', 'Standard', AppTheme.medicalBlue),
                ],
              ),
              const SizedBox(height: 20),

              // Units Needed
              const Text('Units Required (1 Unit = ~450ml)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
              const SizedBox(height: 8),
              Row(
                children: [1, 2, 3, 4, 5, 6].map((u) {
                  final isSel = _units == u;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text('$u'),
                      selected: isSel,
                      onSelected: (_) => setState(() => _units = u),
                      selectedColor: AppTheme.slate900,
                      backgroundColor: AppTheme.slate50,
                      labelStyle: TextStyle(color: isSel ? Colors.white : AppTheme.slate700, fontWeight: FontWeight.w800, fontSize: 13),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // Patient Name (Optional)
              const Text('Patient Name / Case ID (Optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _patientController,
                decoration: const InputDecoration(hintText: 'e.g. ICU Trauma Patient #402', prefixIcon: Icon(LucideIcons.user, size: 16, color: AppTheme.slate400)),
              ),
              const SizedBox(height: 16),

              // Required By Date / Time
              const Text('Required By (Optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _requiredByController,
                decoration: const InputDecoration(hintText: 'e.g. Immediately / Today by 6 PM', prefixIcon: Icon(LucideIcons.clock, size: 16, color: AppTheme.slate400)),
              ),
              const SizedBox(height: 28),

              // Submit Button
              ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _handleSubmit,
                icon: const Icon(LucideIcons.radio, size: 16),
                label: _isSubmitting
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Broadcast to All Compatible Donors'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryRed,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUrgencyChoice(String id, String label, Color color) {
    final isSel = _urgency == id;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _urgency = id),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSel ? color : AppTheme.slate50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSel ? color : AppTheme.slate200),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSel ? Colors.white : AppTheme.slate700,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    );
  }
}
