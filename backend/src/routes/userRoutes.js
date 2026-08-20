import { Router } from 'express';
import { createUser, getUsers, getUserById, deleteUser } from '../controllers/userController.js';
import { createDonor } from '../controllers/donorController.js';
import { createHospital } from '../controllers/hospitalController.js';

const router = Router();

router.route('/')
  .post(createUser)
  .get(getUsers);

router.route('/:user_id')
  .get(getUserById)
  .delete(deleteUser);

router.post('/:user_id/donor', createDonor);
router.post('/:user_id/hospital', createHospital);

export default router;
