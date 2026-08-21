import { Router } from 'express';
import { getDonors, getDonorById, getDonorByUserId, updateDonor, deleteDonor } from '../controllers/donorController.js';

const router = Router();

router.route('/')
  .get(getDonors);

router.get('/user/:user_id', getDonorByUserId);

router.route('/:donor_id')
  .get(getDonorById)
  .put(updateDonor)
  .delete(deleteDonor);

export default router;
