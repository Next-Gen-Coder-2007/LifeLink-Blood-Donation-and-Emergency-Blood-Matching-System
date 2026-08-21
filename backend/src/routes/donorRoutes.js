import { Router } from 'express';
import {
  getDonors,
  getDonorById,
  getDonorByUserId,
  updateDonor,
  deleteDonor,
  sendDirectDonorRequest,
} from '../controllers/donorController.js';

const router = Router();

router.route('/')
  .get(getDonors);

router.get('/user/:user_id', getDonorByUserId);

router.route('/:donor_id')
  .get(getDonorById)
  .put(updateDonor)
  .delete(deleteDonor);

router.post('/:donor_id/direct-request', sendDirectDonorRequest);

export default router;
