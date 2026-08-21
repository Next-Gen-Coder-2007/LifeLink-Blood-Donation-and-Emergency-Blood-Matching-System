import { Router } from 'express';
import {
  getAllDonationHistory,
  getDonorHistory,
  getHospitalHistory,
  createDirectDonation,
  getCertificateById,
  deleteDonationHistory,
} from '../controllers/donationHistoryController.js';

const router = Router();

router.get('/', getAllDonationHistory);
router.post('/', createDirectDonation);
router.get('/donor/:donor_id', getDonorHistory);
router.get('/hospital/:hospital_id', getHospitalHistory);
router.get('/certificate/:certificate_id', getCertificateById);
router.delete('/:id', deleteDonationHistory);

export default router;
