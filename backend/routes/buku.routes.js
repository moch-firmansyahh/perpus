import { Router } from 'express';
import {
  getAllBuku,
  getOneBuku,
  postBuku,
  putBuku,
  removeBuku,
} from '../controllers/buku.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { ensureBodyObject } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllBuku);
router.get('/:id', getOneBuku);
router.post('/', requireRole('PUSTAKAWAN'), ensureBodyObject, postBuku);
router.put('/:id', requireRole('PUSTAKAWAN'), ensureBodyObject, putBuku);
router.delete('/:id', requireRole('PUSTAKAWAN'), removeBuku);

export default router;
