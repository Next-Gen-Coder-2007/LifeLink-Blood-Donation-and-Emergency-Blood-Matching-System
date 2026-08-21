import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory } from '../models/BloodInventory.js';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

let cachedStats = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache

export const getPlatformStats = async (req, res, next) => {
  try {
    const now = Date.now();
    if (cachedStats && now - lastCacheTime < CACHE_TTL_MS) {
      return res.status(200).json(cachedStats);
    }

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
    ALL_BLOOD_GROUPS.forEach((bg) => {
      stockByGroup[bg] = 0;
    });

    inventoryStock.forEach((item) => {
      if (item._id) {
        stockByGroup[item._id] = item.totalUnits;
      }
    });

    const result = {
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      activeRequests,
      stockByGroup,
    };

    cachedStats = result;
    lastCacheTime = now;

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
