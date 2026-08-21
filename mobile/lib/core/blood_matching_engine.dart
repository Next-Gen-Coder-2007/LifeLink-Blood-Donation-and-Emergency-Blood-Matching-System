class MatchScoreResult {
  final int score;
  final String tier; // 'exact' | 'universal' | 'compatible' | 'incompatible'
  final String label;
  final bool compatible;
  final String description;

  MatchScoreResult({
    required this.score,
    required this.tier,
    required this.label,
    required this.compatible,
    required this.description,
  });
}

class BloodMatchingEngine {
  static const List<String> allBloodGroups = [
    'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'
  ];

  // Recipient -> Compatible Donors for Red Blood Cells
  static const Map<String, List<String>> rbcRecipientToDonors = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  };

  // Donor -> Compatible Recipients for Red Blood Cells
  static const Map<String, List<String>> rbcDonorToRecipients = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
  };

  static List<String> getCompatibleDonorGroups(String recipientGroup) {
    final grp = recipientGroup.toUpperCase().trim();
    return rbcRecipientToDonors[grp] ?? [grp];
  }

  static List<String> getCompatibleRecipientGroups(String donorGroup) {
    final grp = donorGroup.toUpperCase().trim();
    return rbcDonorToRecipients[grp] ?? [grp];
  }

  static bool isBloodCompatible(String donorGroup, String recipientGroup) {
    final d = donorGroup.toUpperCase().trim();
    final r = recipientGroup.toUpperCase().trim();
    if (d == r) return true;
    final compatible = getCompatibleDonorGroups(r);
    return compatible.contains(d);
  }

  static MatchScoreResult evaluateBloodMatch(String donorGroup, String recipientGroup) {
    final d = donorGroup.toUpperCase().trim();
    final r = recipientGroup.toUpperCase().trim();

    if (d == r) {
      return MatchScoreResult(
        score: 100,
        tier: 'exact',
        label: 'Exact Match (100%)',
        compatible: true,
        description: 'Identical ABO/Rh compatibility ($d to $r).',
      );
    }

    if (isBloodCompatible(d, r)) {
      if (d == 'O-') {
        return MatchScoreResult(
          score: 90,
          tier: 'universal',
          label: 'Universal Donor (90%)',
          compatible: true,
          description: 'O- Negative Universal cellular match.',
        );
      }
      return MatchScoreResult(
        score: 80,
        tier: 'compatible',
        label: 'Medically Compatible (80%)',
        compatible: true,
        description: '$d red cells are safe for $r recipient.',
      );
    }

    return MatchScoreResult(
      score: 0,
      tier: 'incompatible',
      label: 'Incompatible (0%)',
      compatible: false,
      description: '$d is clinically incompatible with $r.',
    );
  }
}
