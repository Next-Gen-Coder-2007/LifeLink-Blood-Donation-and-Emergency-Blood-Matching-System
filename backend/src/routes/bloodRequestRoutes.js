import { Router } from 'express';
import {
  createBloodRequest,
  getAllBloodRequests,
  getHospitalBloodRequests,
  getDonorBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
} from '../controllers/bloodRequestController.js';

const router = Router();

router.route('/')
  .get(getAllBloodRequests)
  .post(createBloodRequest);

router.get('/hospital/:hospital_id', getHospitalBloodRequests);
router.get('/donor/:donor_id', getDonorBloodRequests);

router.route('/:request_id')
  .get(getBloodRequestById)
  .put(updateBloodRequest)
  .delete(deleteBloodRequest);

export default router;
