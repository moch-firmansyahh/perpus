import { Router } from 'express';
import {
  getAllAnggota,
  getOneAnggota,
  postAnggota,
  putAnggota,
  removeAnggota,
} from '../controllers/anggota.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { ensureBodyObject } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, requireRole('PUSTAKAWAN'));

router.get('/', getAllAnggota);
router.get('/:id', getOneAnggota);
router.post('/', ensureBodyObject, postAnggota);
router.put('/:id', ensureBodyObject, putAnggota);
router.delete('/:id', removeAnggota);

export default router;
