import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { ensureBodyObject } from '../middleware/validate.js';

const router = Router();

router.post('/register', ensureBodyObject, register);
router.post('/login', ensureBodyObject, login);
router.get('/me', authenticate, me);

export default router;
