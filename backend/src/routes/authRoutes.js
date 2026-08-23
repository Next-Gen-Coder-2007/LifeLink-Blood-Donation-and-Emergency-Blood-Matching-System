import { Router } from 'express';
import { loginUser } from '../controllers/authController.js';
import { createUser } from '../controllers/userController.js';

const router = Router();

router.post('/login', loginUser);
router.post('/register', createUser);

export default router;
