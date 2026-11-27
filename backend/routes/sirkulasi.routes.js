import { Router } from 'express';
import { kembali, pinjam, ringkasan } from '../controllers/sirkulasi.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { ensureBodyObject } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/pinjam', requireRole('PUSTAKAWAN', 'MAHASISWA'), ensureBodyObject, pinjam);
router.post('/kembali', requireRole('PUSTAKAWAN'), ensureBodyObject, kembali);
router.get('/ringkasan', requireRole('PUSTAKAWAN'), ringkasan);

export default router;
