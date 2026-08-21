import { Router } from 'express';
import {
  createPledge,
  getPledgesByRequest,
  getPledgesByHospital,
  getPledgesByDonor,
  updatePledgeStatus,
  completePledgeAndVerifyDonation,
} from '../controllers/donationPledgeController.js';

const router = Router();

router.post('/', createPledge);
router.get('/request/:request_id', getPledgesByRequest);
router.get('/hospital/:hospital_id', getPledgesByHospital);
router.get('/donor/:donor_id', getPledgesByDonor);
router.put('/:pledge_id', updatePledgeStatus);
router.post('/:pledge_id/complete', completePledgeAndVerifyDonation);

export default router;
