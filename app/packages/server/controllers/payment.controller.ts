import type { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../prisma';

// Configure S3 client for Aiven Object Storage
const s3 = new S3Client({
   region: 'us-east-1',
   endpoint: process.env.S3_ENDPOINT,
   credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
   },
   // Aiven S3-compatible storage may need forcePathStyle
   forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET || '';

// Configure multer with S3 storage
const storage = multerS3({
   s3,
   bucket: BUCKET,
   contentType: multerS3.AUTO_CONTENT_TYPE,
   key: (_req, file, cb) => {
      const orderNumber = _req.params.orderNumber;
      const ext = path.extname(file.originalname);
      const key = `payments/${orderNumber}-${Date.now()}${ext}`;
      cb(null, key);
   },
});

const upload = multer({
   storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
   fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
         cb(null, true);
      } else {
         cb(new Error('Only JPG, PNG, and WebP images are allowed'));
      }
   },
});

export const uploadPaymentScreenshot = [
   upload.single('paymentScreenshot'),
   async (req: Request, res: Response) => {
      try {
         const orderNumber = Array.isArray(req.params.orderNumber)
            ? req.params.orderNumber[0]
            : req.params.orderNumber;

         if (!orderNumber) {
            return res.status(400).json({ error: 'Order number is required' });
         }

         if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
         }

         const order = await prisma.order.findUnique({
            where: { orderNumber },
         });

         if (!order) {
            return res.status(404).json({ error: 'Order not found' });
         }

         // Use the S3 URL from multer-s3
         const screenshotUrl =
            (req.file as any).location || (req.file as any).key;

         await prisma.order.update({
            where: { orderNumber },
            data: { paymentScreenshotUrl: screenshotUrl },
         });

         return res.json({
            message: 'Payment screenshot uploaded successfully',
            url: screenshotUrl,
         });
      } catch (error) {
         console.error('uploadPaymentScreenshot error:', error);
         return res
            .status(500)
            .json({ error: 'Failed to upload payment screenshot' });
      }
   },
];
