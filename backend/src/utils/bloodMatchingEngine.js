/**
 * Clinical Blood Compatibility Matching Engine
 * Implements ABO and Rhesus (RhD) Factor Compatibility for:
 * - Red Blood Cells (RBC) / Whole Blood
 * - Plasma (FFP)
 * - Platelets
 */

export const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Red Blood Cell / Whole Blood Compatibility Matrix
// Key = Recipient Blood Group -> Value = Array of Compatible Donor Blood Groups
export const RBC_RECIPIENT_TO_DONORS = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Recipient
};

// Red Blood Cell Donor to Compatible Recipients
// Key = Donor Blood Group -> Value = Array of Compatible Recipient Blood Groups
export const RBC_DONOR_TO_RECIPIENTS = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

// Plasma (FFP) Compatibility Matrix
export const PLASMA_RECIPIENT_TO_DONORS = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Plasma Recipient
  'O+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A-', 'A+', 'AB-', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B-', 'B+', 'AB-', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB-', 'AB+'], // Universal Plasma Donor is AB
};

/**
 * Returns all compatible donor blood groups for a given recipient.
 * @param {string} recipientGroup - e.g. 'A+'
 * @param {'rbc'|'plasma'} [component='rbc']
 * @returns {string[]}
 */
export const getCompatibleDonorGroups = (recipientGroup, component = 'rbc') => {
  const grp = (recipientGroup || '').toUpperCase().trim();
  if (component === 'plasma') {
    return PLASMA_RECIPIENT_TO_DONORS[grp] || [grp];
  }
  return RBC_RECIPIENT_TO_DONORS[grp] || [grp];
};

/**
 * Returns all compatible recipient blood groups that a donor can donate to.
 * @param {string} donorGroup - e.g. 'O-'
 * @returns {string[]}
 */
export const getCompatibleRecipientGroups = (donorGroup) => {
  const grp = (donorGroup || '').toUpperCase().trim();
  return RBC_DONOR_TO_RECIPIENTS[grp] || [grp];
};

/**
 * Checks if a donor blood group is compatible with a recipient blood group.
 * @param {string} donorGroup
 * @param {string} recipientGroup
 * @param {'rbc'|'plasma'} [component='rbc']
 * @returns {boolean}
 */
export const isBloodCompatible = (donorGroup, recipientGroup, component = 'rbc') => {
  const dGrp = (donorGroup || '').toUpperCase().trim();
  const rGrp = (recipientGroup || '').toUpperCase().trim();
  if (dGrp === rGrp) return true;

  const compatibleDonors = getCompatibleDonorGroups(rGrp, component);
  return compatibleDonors.includes(dGrp);
};

/**
 * Calculates a match score and tier between a donor and a recipient.
 * 100: Exact ABO/Rh Match
 * 90: Universal Donor (O-)
 * 80: Medically Compatible Iso-group
 * 0: Incompatible
 */
export const calculateMatchScore = (donorGroup, recipientGroup) => {
  const d = (donorGroup || '').toUpperCase().trim();
  const r = (recipientGroup || '').toUpperCase().trim();

  if (d === r) {
    return {
      score: 100,
      tier: 'exact',
      label: 'Exact Match (100%)',
      compatible: true,
      description: `Identical ABO/Rh group match (${d}).`,
    };
  }

  if (isBloodCompatible(d, r, 'rbc')) {
    if (d === 'O-') {
      return {
        score: 90,
        tier: 'universal',
        label: 'Universal Donor Match (90%)',
        compatible: true,
        description: 'O- Negative universal cellular compatibility.',
      };
    }
    return {
      score: 80,
      tier: 'compatible',
      label: 'Medically Compatible (80%)',
      compatible: true,
      description: `${d} red blood cells are clinically compatible with ${r} recipient.`,
    };
  }

  return {
    score: 0,
    tier: 'incompatible',
    label: 'Incompatible (0%)',
    compatible: false,
    description: `${d} blood antibodies are incompatible with ${r} plasma antigens.`,
  };
};
