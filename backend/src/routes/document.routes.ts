import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/upload-url', DocumentController.getUploadUrl);
router.post('/:documentId/confirm', DocumentController.confirmUpload);
router.get('/', DocumentController.getDocuments);
router.get('/:documentId', DocumentController.getDocument);
router.delete('/:documentId', DocumentController.deleteDocument);
router.post('/:documentId/verify', DocumentController.verifyDocument);
router.post('/calendar', DocumentController.integrateCalendar);

export default router; 