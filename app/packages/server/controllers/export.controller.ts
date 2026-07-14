import type { Request, Response } from 'express';
import { exportService } from '../services/export.service';

export const exportController = {
   async exportOrders(req: Request, res: Response) {
      try {
         const eventId = Number(req.params.eventId);
         if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
         }

         const csv = await exportService.exportOrdersToCSV(eventId);

         res.setHeader('Content-Type', 'text/csv');
         res.setHeader(
            'Content-Disposition',
            `attachment; filename="orders-event-${eventId}.csv"`
         );
         return res.send(csv);
      } catch (error) {
         console.error('Failed to export orders:', error);
         return res.status(500).json({ error: 'Internal server error' });
      }
   },

   async exportMenu(req: Request, res: Response) {
      try {
         const eventId = Number(req.params.eventId);
         if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
         }

         const csv = await exportService.exportMenuToCSV(eventId);

         res.setHeader('Content-Type', 'text/csv');
         res.setHeader(
            'Content-Disposition',
            `attachment; filename="menu-event-${eventId}.csv"`
         );
         return res.send(csv);
      } catch (error) {
         console.error('Failed to export menu:', error);
         return res.status(500).json({ error: 'Internal server error' });
      }
   },

   async generatePackingSlip(req: Request, res: Response) {
      try {
         const orderId = Number(req.params.orderId);
         if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
         }

         const packingSlip = await exportService.generatePackingSlip(orderId);
         if (!packingSlip) {
            return res.status(404).json({ error: 'Order not found' });
         }

         return res.json(packingSlip);
      } catch (error) {
         console.error('Failed to generate packing slip:', error);
         return res.status(500).json({ error: 'Internal server error' });
      }
   },
};
