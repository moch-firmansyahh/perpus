import { Router } from 'express';
import {
  getAllPeminjaman,
  getOnePeminjaman,
  postPeminjaman,
  putPeminjaman,
  removePeminjaman,
} from '../controllers/peminjaman.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { ensureBodyObject } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllPeminjaman);
router.get('/:id', getOnePeminjaman);
router.post('/', requireRole('PUSTAKAWAN'), ensureBodyObject, postPeminjaman);
router.put('/:id', requireRole('PUSTAKAWAN'), ensureBodyObject, putPeminjaman);
router.delete('/:id', requireRole('PUSTAKAWAN'), removePeminjaman);

export default router;
