import { Router } from 'express';
import multer from 'multer';
import { uploadToS3 } from './s3-storage.js';
import { randomBytes } from 'crypto';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const randomSuffix = randomBytes(8).toString('hex');
    const fileName = `wishlist-${Date.now()}-${randomSuffix}.${fileExtension}`;

    // Upload to Selectel S3
    const s3Key = `wishlist-images/${fileName}`;
    const url = await uploadToS3(
      s3Key,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url });
  } catch (error) {
    console.error('[Upload] Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
