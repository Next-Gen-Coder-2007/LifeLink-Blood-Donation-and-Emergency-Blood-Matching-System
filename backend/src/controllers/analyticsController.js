import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { DonationPledge } from '../models/DonationPledge.js';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      requestStatusGroups,
      totalDonations,
      totalPledges,
      inventoryStock,
    ] = await Promise.all([
      User.estimatedDocumentCount(),
      Donor.estimatedDocumentCount(),
      Hospital.estimatedDocumentCount(),
      BloodRequest.estimatedDocumentCount(),
      BloodRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      DonationHistory.estimatedDocumentCount(),
      DonationPledge.estimatedDocumentCount(),
      BloodInventory.aggregate([
        {
          $group: {
            _id: '$blood_group',
            totalUnits: { $sum: '$units' },
          },
        },
      ]),
    ]);

    let activeRequests = 0;
    let fulfilledRequests = 0;
    requestStatusGroups.forEach((g) => {
      if (g._id === 'searching') activeRequests = g.count;
      if (g._id === 'fulfilled' || g._id === 'completed') fulfilledRequests += g.count;
    });

    const stockByGroup = {};
    let totalStockUnits = 0;
    ALL_BLOOD_GROUPS.forEach((bg) => {
      stockByGroup[bg] = 0;
    });

    inventoryStock.forEach((item) => {
      if (item._id) {
        stockByGroup[item._id] = item.totalUnits;
        totalStockUnits += item.totalUnits;
      }
    });

    return res.status(200).json({
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      activeRequests,
      fulfilledRequests,
      totalDonations,
      totalPledges,
      totalStockUnits,
      stockByGroup,
    });
  } catch (error) {
    next(error);
  }
};
