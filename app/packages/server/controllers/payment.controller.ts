import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../prisma';

// Configure multer for local storage
const storage = multer.diskStorage({
   destination: path.join(__dirname, '..', 'uploads'),
   filename: (req, file, cb) => {
      const orderNumber = req.params.orderNumber;
      const ext = path.extname(file.originalname);
      cb(null, `${orderNumber}-${Date.now()}${ext}`);
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

         const screenshotUrl = `/uploads/${req.file.filename}`;

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
