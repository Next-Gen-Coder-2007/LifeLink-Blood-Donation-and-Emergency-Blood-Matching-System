import 'package:flutter/material.dart';
import '../config/app_icons.dart';
import '../config/theme.dart';
import '../models/donor_model.dart';
import 'blood_group_badge.dart';

class DirectDirectiveSheet extends StatefulWidget {
  final DonorModel donor;
  final String hospitalName;
  final Function(String message, int units, String urgency) onDispatch;

  const DirectDirectiveSheet({
    super.key,
    required this.donor,
    required this.hospitalName,
    required this.onDispatch,
  });

  @override
  State<DirectDirectiveSheet> createState() => _DirectDirectiveSheetState();
}

class _DirectDirectiveSheetState extends State<DirectDirectiveSheet> {
  String _urgency = 'emergency';
  int _units = 1;
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _templates = [
    {
      'label': 'Trauma / Surgery Critical',
      'units': 2,
      'urgency': 'emergency',
      'text': 'CRITICAL TRANSFUSION DIRECTIVE: Immediate blood units required for trauma/surgery emergency. Your blood group is an exact/compatible match. Please visit our triage desk immediately.',
    },
    {
      'label': 'Stock Deficit Replenishment',
      'units': 1,
      'urgency': 'urgent',
      'text': 'URGENT REPLENISHMENT DIRECTIVE: Refrigerated blood bank stock for your blood type has dropped below safety levels. Your donation is urgently requested today.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _messageController.text = _templates[0]['text'];
  }

  @override
  void dispose() {
    _messageController.dispose();
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
                child: const Icon(LucideIcons.radio, color: AppTheme.primaryRed, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Dispatch Direct Directive',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.slate900,
                      ),
                    ),
                    Text(
                      widget.donor.donorName,
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                    ),
                  ],
                ),
              ),
              BloodGroupBadge(bloodGroup: widget.donor.bloodGroup),
            ],
          ),
          const SizedBox(height: 18),

          // Clinical Templates
          const Text(
            '1-Click Clinical Templates',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate700),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _templates.map((tmpl) {
              return ActionChip(
                label: Text(tmpl['label']),
                onPressed: () {
                  setState(() {
                    _units = tmpl['units'];
                    _urgency = tmpl['urgency'];
                    _messageController.text = tmpl['text'];
                  });
                },
                backgroundColor: AppTheme.slate50,
                side: const BorderSide(color: AppTheme.slate200),
                labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.slate700),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),

          // Units Selector
          Row(
            children: [
              const Text('Units Needed:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
              const SizedBox(width: 12),
              ...[1, 2, 3, 4].map((u) {
                final isSel = _units == u;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text('$u'),
                    selected: isSel,
                    onSelected: (_) => setState(() => _units = u),
                    selectedColor: AppTheme.slate900,
                    backgroundColor: AppTheme.slate50,
                    labelStyle: TextStyle(color: isSel ? Colors.white : AppTheme.slate700, fontSize: 11, fontWeight: FontWeight.w800),
                  ),
                );
              }),
            ],
          ),
          const SizedBox(height: 14),

          // Message Preview
          TextField(
            controller: _messageController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Enter clinical emergency message...',
            ),
          ),
          const SizedBox(height: 20),

          // Submit
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isSubmitting
                  ? null
                  : () async {
                      setState(() => _isSubmitting = true);
                      final navigator = Navigator.of(context);
                      await widget.onDispatch(
                        _messageController.text.trim(),
                        _units,
                        _urgency,
                      );
                      if (mounted) navigator.pop();
                    },
              icon: const Icon(LucideIcons.send, size: 14),
              label: _isSubmitting
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Dispatch Clinical Directive'),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryRed),
            ),
          ),
        ],
      ),
    );
  }
}
