import { Router } from 'express';
import { getHospitals, getHospitalById, updateHospital, deleteHospital } from '../controllers/hospitalController.js';
import { getBloodBank, updateBloodBank } from '../controllers/bloodBankController.js';

const router = Router();

router.route('/')
  .get(getHospitals);

router.route('/:hospital_id')
  .get(getHospitalById)
  .put(updateHospital)
  .delete(deleteHospital);

router.route('/:hospital_id/blood-bank')
  .get(getBloodBank)
  .put(updateBloodBank);

export default router;
