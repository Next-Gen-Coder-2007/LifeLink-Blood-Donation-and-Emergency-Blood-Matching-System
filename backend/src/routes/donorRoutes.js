import { Router } from 'express';
import { getDonors, getDonorById, updateDonor, deleteDonor } from '../controllers/donorController.js';

const router = Router();

router.route('/')
  .get(getDonors);

router.route('/:donor_id')
  .get(getDonorById)
  .put(updateDonor)
  .delete(deleteDonor);

export default router;
