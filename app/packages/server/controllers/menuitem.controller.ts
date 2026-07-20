import { MenuCategory } from '@prisma/client';
import type { Request, Response } from 'express';
import z from 'zod';
import { menuItemService } from '../services/menuitem.service';

const menuItemCreateRequestSchema = z.object({
   eventId: z.number(),
   itemCode: z.string().trim().min(1, 'item code is required'),
   name: z.string().trim().min(1, 'item name is required'),
   category: z.nativeEnum(MenuCategory),
   price: z.number().positive('price must be a positive number'),
   stockQty: z
      .number()
      .int()
      .nonnegative('stock quantity must be a non-negative integer'),
});

const menuItemCreateBatchRequestSchema = z.object({
   eventId: z.number(),
   items: z.array(
      z.object({
         itemCode: z.string().trim().min(1, 'item code is required'),
         name: z.string().trim().min(1, 'item name is required'),
         category: z.nativeEnum(MenuCategory),
         price: z.number().positive('price must be a positive number'),
         stockQty: z
            .number()
            .int()
            .nonnegative('stock quantity must be a non-negative integer'),
      })
   ),
});

const menuItemUpdateRequestSchema = z.object({
   itemCode: z.string().trim().min(1, 'item code is required').optional(),
   name: z.string().trim().min(1, 'item name is required').optional(),
   category: MenuCategory,
   price: z.number().positive('price must be a positive number').optional(),
   stockQty: z
      .number()
      .int()
      .nonnegative('stock quantity must be a non-negative integer')
      .optional(),
});

export const menuItemController = {
   async createMenuItem(req: Request, res: Response) {
      // logic to create a new menu item

      const parseResult = menuItemCreateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
         return res.status(400).json({ error: parseResult.error.format() });
      }

      try {
         const {
            eventId,
            itemCode,
            name,
            category: categoryValue,
            price,
            stockQty,
         } = parseResult.data;

         const category: MenuCategory = categoryValue as MenuCategory;

         await menuItemService.createMenuItem({
            eventId,
            itemCode,
            name,
            category,
            price,
            stockQty,
            isSoldOut: false,
            createdAt: new Date(),
         });

         res.json({ message: 'Menu Item created successfully' });
      } catch (error: any) {
         // Handle unique constraint violations
         if (error?.code === 'P2002') {
            const target = error?.meta?.target;
            if (target?.includes('name')) {
               return res.status(409).json({
                  error: `Menu item name "${parseResult.data.name}" already exists in this event`,
               });
            }
            if (target?.includes('itemCode')) {
               return res.status(409).json({
                  error: `Menu item code "${parseResult.data.itemCode}" already exists in this event`,
               });
            }
         }
         return res.status(500).json({ error: 'Failed to create menu item' });
      }
   },

   async createMenuItemBatch(req: Request, res: Response) {
      const parseResult = menuItemCreateBatchRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
         return res.status(400).json({ error: parseResult.error.format() });
      }

      try {
         const { eventId, items } = parseResult.data;

         const menuItemsToCreate = items.map((item) => ({
            eventId,
            itemCode: item.itemCode,
            name: item.name,
            category: item.category as MenuCategory,
            price: item.price,
            stockQty: item.stockQty,
            isSoldOut: false,
            createdAt: new Date(),
         }));

         await menuItemService.createMenuItemsBatch(menuItemsToCreate);

         res.json({ message: 'Menu Items created successfully' });
      } catch (error: any) {
         // Handle unique constraint violations
         if (error?.code === 'P2002') {
            const target = error?.meta?.target;
            if (target?.includes('name')) {
               return res.status(409).json({
                  error: 'One or more menu item names already exist in this event',
               });
            }
            if (target?.includes('itemCode')) {
               return res.status(409).json({
                  error: 'One or more menu item codes already exist in this event',
               });
            }
         }
         return res.status(500).json({ error: 'Failed to create menu items' });
      }
   },

   async getAllMenuItemsByEventId(req: Request, res: Response) {
      try {
         const eventId = Number(req.params.eventId);

         const menuItems =
            await menuItemService.getAllMenuItemsByEventId(eventId);
         res.json({ menuItems: menuItems });
      } catch (error) {
         return res
            .status(500)
            .json({ error: 'Failed to retrieve menu items' });
      }
   },

   async getMenuItemById(req: Request, res: Response) {
      try {
         const id = Number(req.params.id);

         const menuItem = await menuItemService.getMenuItemById(id);
         res.json({ menuItem: menuItem });
      } catch (error) {
         return res.status(500).json({ error: 'Failed to retrieve menu item' });
      }
   },

   async updateMenuItem(req: Request, res: Response) {
      const parseResult = menuItemUpdateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
         return res.status(400).json({ error: parseResult.error.format() });
      }

      try {
         const menuItemId = Number(req.params.id);

         if (isNaN(menuItemId)) {
            return res.status(400).json({ error: 'Invalid menu item ID' });
         }

         const {
            itemCode,
            name,
            category: categoryValue,
            price,
            stockQty,
         } = parseResult.data;
         const category = categoryValue as MenuCategory;

         await menuItemService.updateMenuItem(menuItemId, {
            itemCode,
            name,
            category,
            price,
            stockQty,
         });

         res.json({ message: 'Menu Item updated successfully' });
      } catch (error) {
         return res.status(500).json({ error: 'Failed to update menu item' });
      }
   },

   async deleteMenuItem(req: Request, res: Response) {
      try {
         const menuItemId = Number(req.params.id);

         if (isNaN(menuItemId)) {
            return res.status(400).json({ error: 'Invalid menu item ID' });
         }

         await menuItemService.deleteMenuItem(menuItemId);

         res.json({
            message: `Menu Item deleted successfully`,
         });
      } catch (error) {
         return res.status(500).json({ error: 'Failed to delete menu item' });
      }
   },
};
