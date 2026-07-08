import { type MenuItem } from '@prisma/client';
import { menuItemRepository } from '../repositories/menuitem.repository';

export const menuItemService = {
   async createMenuItem(data: Omit<MenuItem, 'id'>): Promise<void> {
      await menuItemRepository.createMenuItem(data);
   },

   async createMenuItemsBatch(items: Omit<MenuItem, 'id'>[]): Promise<void> {
      await menuItemRepository.createMenuItemsBatch(items);
   },

   async getAllMenuItemsByEventId(eventId: number): Promise<MenuItem[]> {
      return menuItemRepository.getAllMenuItemsByEventId(eventId);
   },

   async getMenuItemById(id: number): Promise<MenuItem | null> {
      return menuItemRepository.getMenuItemById(id);
   },

   async updateMenuItem(
      id: number,
      data: Partial<Omit<MenuItem, 'id'>>
   ): Promise<void> {
      await menuItemRepository.updateMenuItem(id, data);
   },

   async deleteMenuItem(id: number): Promise<void> {
      await menuItemRepository.deleteMenuItem(id);
   },
};
