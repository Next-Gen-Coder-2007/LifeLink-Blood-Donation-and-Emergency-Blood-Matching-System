import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory } from '../models/BloodInventory.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDonors, totalHospitals, totalRequests, activeRequests, inventoryStock] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'searching' }),
      BloodInventory.aggregate([
        {
          $group: {
            _id: '$blood_group',
            totalUnits: { $sum: '$units' },
          },
        },
      ]),
    ]);

    const stockByGroup = {};
    inventoryStock.forEach((item) => {
      stockByGroup[item._id] = item.totalUnits;
    });

    return res.status(200).json({
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      activeRequests,
      stockByGroup,
    });
  } catch (error) {
    next(error);
  }
};
