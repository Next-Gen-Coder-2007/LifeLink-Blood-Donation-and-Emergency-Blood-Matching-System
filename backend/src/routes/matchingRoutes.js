import { Router } from 'express';
import {
  getCompatibleDonors,
  getMatchingRequestsForDonor,
  getCompatibilityMatrix,
  evaluateCompatibility,
} from '../controllers/matchingController.js';

const router = Router();

router.get('/donors', getCompatibleDonors);
router.get('/requests', getMatchingRequestsForDonor);
router.get('/matrix', getCompatibilityMatrix);
router.post('/evaluate', evaluateCompatibility);

export default router;
