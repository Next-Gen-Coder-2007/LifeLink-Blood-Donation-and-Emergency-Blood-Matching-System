import { Router } from 'express';
import {
  createDonor,
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

router.route('/user/:user_id')
  .get(getDonorByUserId)
  .post(createDonor);

router.route('/:donor_id')
  .get(getDonorById)
  .put(updateDonor)
  .delete(deleteDonor);

router.post('/:donor_id/direct-request', sendDirectDonorRequest);

export default router;
