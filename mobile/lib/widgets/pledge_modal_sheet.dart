import 'package:flutter/material.dart';
import '../config/app_icons.dart';
import '../config/theme.dart';
import '../models/blood_request_model.dart';
import 'blood_group_badge.dart';

class PledgeModalSheet extends StatefulWidget {
  final BloodRequestModel request;
  final Function(String arrivalTime, String notes) onConfirm;

  const PledgeModalSheet({
    super.key,
    required this.request,
    required this.onConfirm,
  });

  @override
  State<PledgeModalSheet> createState() => _PledgeModalSheetState();
}

class _PledgeModalSheetState extends State<PledgeModalSheet> {
  String _selectedArrival = 'Within 30 Mins';
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _arrivalOptions = [
    'Within 30 Mins',
    'Within 1 Hour',
    'Within 2 Hours',
    'Tomorrow Morning',
  ];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.slate200,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.primaryRedLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.heartHandshake, color: AppTheme.primaryRed, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Pledge Blood Donation',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.slate900,
                      ),
                    ),
                    Text(
                      widget.request.hospitalName,
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                    ),
                  ],
                ),
              ),
              BloodGroupBadge(bloodGroup: widget.request.bloodGroup),
            ],
          ),
          const SizedBox(height: 20),

          // Estimated Arrival Selector
          const Text(
            'Estimated Arrival Time',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _arrivalOptions.map((opt) {
              final isSel = _selectedArrival == opt;
              return ChoiceChip(
                label: Text(opt),
                selected: isSel,
                onSelected: (_) => setState(() => _selectedArrival = opt),
                selectedColor: AppTheme.slate900,
                backgroundColor: AppTheme.slate50,
                labelStyle: TextStyle(
                  color: isSel ? Colors.white : AppTheme.slate700,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
                side: BorderSide(
                  color: isSel ? AppTheme.slate900 : AppTheme.slate200,
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Clinical Notes TextField
          const Text(
            'Notes / Arrival Details (Optional)',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _notesController,
            maxLines: 2,
            decoration: const InputDecoration(
              hintText: 'e.g. Bringing donor ID, arriving by metro...',
            ),
          ),
          const SizedBox(height: 24),

          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting
                  ? null
                  : () async {
                      setState(() => _isSubmitting = true);
                      final navigator = Navigator.of(context);
                      await widget.onConfirm(_selectedArrival, _notesController.text.trim());
                      if (mounted) navigator.pop();
                    },
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Confirm Donation Pledge'),
            ),
          ),
        ],
      ),
    );
  }
}
