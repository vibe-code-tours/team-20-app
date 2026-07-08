import { type Order } from '@prisma/client';
import { prisma } from '../prisma';
import { orderRepository } from '../repositories/order.repository';
import { customerService } from './customer.service';

type OrderItemInput = { menuItemId: number; quantity: number };

export const orderService = {
   async createOrder(
      note: string | null,
      eventId: number,
      customer: { name: string; phone: string },
      items: OrderItemInput[]
   ): Promise<Order> {
      // check if customer exists, if not create a new customer
      let existingCustomer = await customerService.getCustomerByNameAndPhone(
         customer.name,
         customer.phone
      );

      if (!existingCustomer) {
         existingCustomer = await customerService.createCustomer({
            name: customer.name,
            phone: customer.phone,
            createdAt: new Date(),
         });
      }

      if (!existingCustomer.id) {
         throw new Error('Failed to create or retrieve customer');
      }

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Event not found');
      if (event.preOrderClose && new Date() > event.preOrderClose) {
         throw new Error('Pre-order is closed for this event');
      }

      // generate order number (e.g. ORD-20240715-0001)
      const nzDate = new Intl.DateTimeFormat('en-CA', {
         timeZone: 'Pacific/Auckland',
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
      }).format(new Date()); // "2026-05-26"

      const dateStr = nzDate.replace(/-/g, ''); // "20260526"

      const lastOrder = await orderRepository.getLastOrderByEventId(eventId);
      let orderCount = 0;
      if (lastOrder?.orderNumber) {
         const lastOrderCount = parseInt(
            lastOrder.orderNumber.split('-')[2] ?? '0'
         );
         orderCount = Number.isNaN(lastOrderCount) ? 0 : lastOrderCount;
      }
      const orderNumber = `ORD-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`;

      return orderRepository.createOrderWithStock(
         orderNumber,
         note,
         eventId,
         existingCustomer.id,
         items
      );
   },

   async getOrders(): Promise<Order[]> {
      return orderRepository.getOrders();
   },

   async getOrderById(orderId: number): Promise<Order | null> {
      return orderRepository.getOrderById(orderId);
   },

   async getOrdersByEventId(eventId: number): Promise<Order[]> {
      return orderRepository.getOrdersByEventId(eventId);
   },

   async getOrderByOrderNo(orderNumber: string): Promise<Order | null> {
      return orderRepository.getOrderByOrderNo(orderNumber);
   },

   async getOrdersByCustomer(customerId: number): Promise<Order[]> {
      return orderRepository.getOrdersByCustomer(customerId);
   },

   async getOrdersByCustomerAndEvent(
      customerId: number,
      eventId: number
   ): Promise<Order[]> {
      return orderRepository.getOrdersByCustomerAndEvent(customerId, eventId);
   },

   async updateOrderByOrderNo(
      orderNumber: string,
      note: string | null,
      items: OrderItemInput[]
   ): Promise<Order> {
      const existingOrder =
         await orderRepository.getOrderByOrderNo(orderNumber);
      if (!existingOrder) throw new Error('Order not found');
      if (existingOrder.status === 'CANCELLED')
         throw new Error('Order is cancelled');
      if (existingOrder.status === 'COMPLETED')
         throw new Error('Order is completed');
      const event = await prisma.event.findUnique({
         where: { id: existingOrder.eventId },
      });
      if (event?.preOrderClose && new Date() > event.preOrderClose) {
         throw new Error('Pre-order is closed for this event');
      }

      return orderRepository.updateOrderByOrderNoWithStock(
         orderNumber,
         note,
         items
      );
   },

   async confirmOrderByOrderNumber(orderNumber: string): Promise<Order> {
      return orderRepository.confirmOrderByOrderNumber(orderNumber);
   },

   async completeOrderByOrderNumber(orderNumber: string): Promise<Order> {
      return orderRepository.completeOrderByOrderNumber(orderNumber);
   },

   async cancelOrderByOrderNumber(orderNumber: string): Promise<Order> {
      return orderRepository.cancelOrderByOrderNumberWithStock(orderNumber);
   },

   async deleteOrderByOrderNumber(orderNumber: string): Promise<Order> {
      return orderRepository.deleteOrderByOrderNumberWithStock(orderNumber);
   },
};
