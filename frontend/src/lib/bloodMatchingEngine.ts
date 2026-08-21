/**
 * Clinical Blood Group Matching Engine (Frontend)
 * ABO & Rhesus (Rh) Compatibility Matrices for Red Blood Cells & Plasma
 */

export const BLOOD_GROUPS = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

// Red Blood Cell / Whole Blood Compatibility Matrix
export const RBC_RECIPIENT_TO_DONORS: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal Recipient
};

export const RBC_DONOR_TO_RECIPIENTS: Record<string, string[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal Donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export interface MatchScoreResult {
  score: number;
  tier: "exact" | "universal" | "compatible" | "incompatible";
  label: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  compatible: boolean;
  description: string;
}

export function getCompatibleDonorGroups(recipientGroup: string): string[] {
  const grp = (recipientGroup || "").toUpperCase().trim();
  return RBC_RECIPIENT_TO_DONORS[grp] || [grp];
}

export function getCompatibleRecipientGroups(donorGroup: string): string[] {
  const grp = (donorGroup || "").toUpperCase().trim();
  return RBC_DONOR_TO_RECIPIENTS[grp] || [grp];
}

export function isBloodCompatible(donorGroup: string, recipientGroup: string): boolean {
  const d = (donorGroup || "").toUpperCase().trim();
  const r = (recipientGroup || "").toUpperCase().trim();
  if (d === r) return true;
  const compatible = getCompatibleDonorGroups(r);
  return compatible.includes(d);
}

export function evaluateBloodMatch(donorGroup: string, recipientGroup: string): MatchScoreResult {
  const d = (donorGroup || "").toUpperCase().trim();
  const r = (recipientGroup || "").toUpperCase().trim();

  if (d === r) {
    return {
      score: 100,
      tier: "exact",
      label: "Exact Match (100%)",
      badgeColor: "text-emerald-700",
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-200",
      compatible: true,
      description: `Identical ABO/Rh compatibility (${d} to ${r}).`,
    };
  }

  if (isBloodCompatible(d, r)) {
    if (d === "O-") {
      return {
        score: 90,
        tier: "universal",
        label: "Universal Donor (90%)",
        badgeColor: "text-purple-700",
        badgeBg: "bg-purple-50",
        badgeBorder: "border-purple-200",
        compatible: true,
        description: "O- Negative Universal Donor cellular match.",
      };
    }

    return {
      score: 80,
      tier: "compatible",
      label: "Medically Compatible (80%)",
      badgeColor: "text-blue-700",
      badgeBg: "bg-blue-50",
      badgeBorder: "border-blue-200",
      compatible: true,
      description: `${d} red cells are clinically safe for ${r} recipient.`,
    };
  }

  return {
    score: 0,
    tier: "incompatible",
    label: "Incompatible (0%)",
    badgeColor: "text-red-700",
    badgeBg: "bg-red-50",
    badgeBorder: "border-red-200",
    compatible: false,
    description: `${d} is clinically incompatible with ${r}.`,
  };
}
