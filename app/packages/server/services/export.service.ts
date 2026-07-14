import { dashboardRepository } from '../repositories/dashboard.repository';

export const exportService = {
   async exportOrdersToCSV(eventId: number) {
      const { orders } = await dashboardRepository.getOrdersByEventId(eventId, {
         limit: 10000, // Get all orders
      });

      // CSV header
      const header = [
         'Order Number',
         'Customer Name',
         'Customer Phone',
         'Status',
         'Total',
         'Items',
         'Created At',
      ].join(',');

      // CSV rows
      const rows = orders.map((order) => {
         const items = order.items
            .map((item) => `${item.menuItem.name} x${item.qty}`)
            .join('; ');

         return [
            order.orderNumber,
            `"${order.customer.name}"`,
            order.customer.phone,
            order.status,
            order.total.toFixed(2),
            `"${items}"`,
            order.createdAt.toISOString(),
         ].join(',');
      });

      return [header, ...rows].join('\n');
   },

   async exportMenuToCSV(eventId: number) {
      const menuItems =
         await dashboardRepository.getMenuItemsByEventId(eventId);

      // CSV header
      const header = [
         'Item Code',
         'Name',
         'Category',
         'Price',
         'Stock Quantity',
         'Sold Out',
      ].join(',');

      // CSV rows
      const rows = menuItems.map((item) => {
         return [
            item.itemCode,
            `"${item.name}"`,
            item.category,
            item.price.toFixed(2),
            item.stockQty,
            item.isSoldOut ? 'Yes' : 'No',
         ].join(',');
      });

      return [header, ...rows].join('\n');
   },

   async generatePackingSlip(orderId: number) {
      const order = await dashboardRepository.getOrderById(orderId);
      if (!order) {
         return null;
      }

      const items = order.items.map((item) => ({
         name: item.menuItem.name,
         itemCode: item.menuItem.itemCode,
         qty: item.qty,
         unitPrice: item.unitPrice,
         subtotal: item.subtotal,
      }));

      return {
         orderNumber: order.orderNumber,
         customerName: order.customer.name,
         customerPhone: order.customer.phone,
         eventName: order.event.name,
         eventDate: order.event.eventDate,
         location: order.event.location,
         pickupInfo: order.event.pickupInfo,
         items,
         total: order.total,
         note: order.note,
         createdAt: order.createdAt,
      };
   },
};
