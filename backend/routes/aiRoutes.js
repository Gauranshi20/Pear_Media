import express from 'express';
import multer from 'multer';
import { enhancePrompt, generateImage, analyzeImageAndVariations } from '../controllers/aiController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/enhance-prompt', enhancePrompt);
router.post('/generate-image', generateImage);
router.post('/image-variations', upload.single('image'), analyzeImageAndVariations);

export default router;


