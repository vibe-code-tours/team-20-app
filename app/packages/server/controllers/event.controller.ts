import type { Request, Response } from 'express';
import z from 'zod';
import { eventService } from '../services/event.service';

const eventCreateRequestSchema = z.object({
   name: z.string().trim().min(1, 'event name is required'),
   eventInfo: z.string().trim().min(1, 'event info is required'),
   pickupInfo: z.string().trim().optional(),
   paymentInfo: z.string().trim().optional(),
   eventDate: z.coerce.date(),
   location: z.string().trim().min(1, 'location is required'),
   preOrderClose: z.coerce.date().optional(),
});

const eventUpdateRequestSchema = z.object({
   name: z.string().trim().min(1, 'event name is required').optional(),
   eventInfo: z.string().trim().min(1, 'event info is required').optional(),
   pickupInfo: z.string().trim().optional(),
   paymentInfo: z.string().trim().optional(),
   eventDate: z.coerce.date().optional(),
   location: z.string().trim().min(1, 'location is required').optional(),
   preOrderClose: z.coerce.date().optional(),
});

export const eventController = {
   async createEvent(req: Request, res: Response) {
      // Logic to create a new event
      const parseResult = eventCreateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
         return res.status(400).json({ error: parseResult.error.format() });
      }
      try {
         const {
            name,
            eventInfo,
            pickupInfo,
            paymentInfo,
            eventDate,
            location,
            preOrderClose,
         } = parseResult.data;

         let normalizedPreOrderClose: Date | undefined = preOrderClose;
         if (normalizedPreOrderClose instanceof Date) {
            normalizedPreOrderClose.setHours(23, 59, 59, 999);
         }

         await eventService.createEvent({
            name,
            eventInfo,
            pickupInfo,
            paymentInfo,
            eventDate,
            location,
            preOrderClose: normalizedPreOrderClose,
         });

         return res.json({ message: 'Event created successfully' });
      } catch (error) {
         console.error('createEvent error:', error);
         return res.status(500).json({ error: 'Failed to create event' });
      }
   },
   async getEvents(req: Request, res: Response) {
      // Logic to retrieve all events
      try {
         const events = await eventService.getEvents();
         return res.json({ events: events }); // Return an array of events
      } catch (error) {
         return res.status(500).json({ error: 'Failed to retrieve events' });
      }
   },
   async getAciveEvents(req: Request, res: Response) {
      // logic to retrive all active events
      try {
         const activeEvents = await eventService.getActiveEvents();
         return res.json({ activeEvents: activeEvents }); // Return an array of active events
      } catch (error) {
         return res
            .status(500)
            .json({ error: 'Failed to retrieve active events' });
      }
   },
   async getEventById(req: Request, res: Response) {
      // logic to retrive an event by ID. Include menu items and event details
      try {
         const eventId = Number(req.params.id);

         if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
         }

         const event = await eventService.getEventById(eventId);
         return res.json({ event: event }); // Return the event with the specified ID
      } catch (error) {
         return res.status(500).json({ error: 'Failed to retrieve event' });
      }
   },
   async updateEvent(req: Request, res: Response) {
      const parseResult = eventUpdateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
         return res.status(400).json({ error: parseResult.error.format() });
      }
      // logic to update an event by ID
      try {
         const eventId = Number(req.params.id);

         if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
         }

         const {
            name,
            eventInfo,
            pickupInfo,
            paymentInfo,
            eventDate,
            location,
            preOrderClose,
         } = parseResult.data;

         await eventService.updateEvent(eventId, {
            name,
            eventInfo,
            pickupInfo,
            paymentInfo,
            eventDate,
            location,
            preOrderClose,
         });

         return res.json({
            message: `Event updated successfully`,
         });
      } catch (error) {
         return res.status(500).json({ error: 'Failed to update event' });
      }
   },
   async deleteEvent(req: Request, res: Response) {
      // Logic to delete an event by ID
      try {
         const eventId = Number(req.params.id);

         if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
         }

         await eventService.deleteEvent(eventId);

         return res.json({
            message: `Event deleted successfully`,
         });
      } catch (error) {
         return res.status(500).json({ error: 'Failed to delete event' });
      }
   },
};
