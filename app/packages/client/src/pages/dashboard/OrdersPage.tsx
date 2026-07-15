import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import {
   Search,
   Eye,
   CheckCircle,
   XCircle,
   ChevronLeft,
   ChevronRight,
   Image,
} from 'lucide-react';
import EventSelector from '@/components/dashboard/EventSelector';

interface Order {
   id: number;
   orderNumber: string;
   status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
   total: number;
   note: string | null;
   paymentScreenshotUrl: string | null;
   createdAt: string;
   customer: {
      name: string;
      phone: string;
   };
   items: {
      qty: number;
      unitPrice: number;
      subtotal: number;
      menuItem: {
         name: string;
         itemCode: string;
      };
   }[];
   event: {
      id: number;
      name: string;
   };
}

interface Pagination {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

export default function OrdersPage() {
   const [searchParams, setSearchParams] = useSearchParams();
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [pagination, setPagination] = useState<Pagination | null>(null);
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [showPaymentModal, setShowPaymentModal] = useState(false);

   const eventId = searchParams.get('eventId');
   const status = searchParams.get('status') || 'ALL';
   const search = searchParams.get('search') || '';
   const page = parseInt(searchParams.get('page') || '1');

   useEffect(() => {
      if (eventId) {
         fetchOrders();
      }
   }, [eventId, status, search, page]);

   const fetchOrders = async () => {
      if (!eventId) return;

      setLoading(true);
      try {
         const params = new URLSearchParams({
            status,
            search,
            page: page.toString(),
            limit: '10',
         });
         const response = await api.get(
            `/dashboard/${eventId}/orders?${params}`
         );
         setOrders(response.data.orders);
         setPagination(response.data.pagination);
      } catch (error) {
         console.error('Failed to fetch orders:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleStatusUpdate = async (orderId: number, newStatus: string) => {
      try {
         await api.patch(`/dashboard/orders/${orderId}/status`, {
            status: newStatus,
         });
         setOrders(
            orders.map((o) =>
               o.id === orderId ? { ...o, status: newStatus as any } : o
            )
         );
         if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus as any });
         }
      } catch (error) {
         console.error('Failed to update order status:', error);
         alert('Failed to update order status');
      }
   };

   const updateSearchParams = (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
         params.set(key, value);
      } else {
         params.delete(key);
      }
      if (key !== 'page') {
         params.set('page', '1');
      }
      setSearchParams(params);
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <EventSelector />
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <button
               onClick={() =>
                  window.open(`/api/export/${eventId}/orders`, '_blank')
               }
               className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted"
            >
               Export CSV
            </button>
         </div>

         {/* Filters */}
         <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <input
                  type="text"
                  placeholder="Search by order number, customer name, or phone..."
                  value={search}
                  onChange={(e) => updateSearchParams('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground"
               />
            </div>
            <select
               value={status}
               onChange={(e) => updateSearchParams('status', e.target.value)}
               className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
            >
               <option value="ALL">All Status</option>
               <option value="PENDING">Pending</option>
               <option value="CONFIRMED">Confirmed</option>
               <option value="COMPLETED">Completed</option>
               <option value="CANCELLED">Cancelled</option>
            </select>
         </div>

         {/* Orders List */}
         {loading ? (
            <div className="space-y-4">
               {[...Array(5)].map((_, i) => (
                  <div
                     key={i}
                     className="h-24 bg-muted rounded-lg animate-pulse"
                  />
               ))}
            </div>
         ) : orders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
               <p className="text-muted-foreground">No orders found</p>
            </div>
         ) : (
            <div className="space-y-4">
               {orders.map((order) => (
                  <OrderCard
                     key={order.id}
                     order={order}
                     onView={() => setSelectedOrder(order)}
                     onStatusUpdate={handleStatusUpdate}
                  />
               ))}
            </div>
         )}

         {/* Pagination */}
         {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
               <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(
                     pagination.page * pagination.limit,
                     pagination.total
                  )}{' '}
                  of {pagination.total} orders
               </p>
               <div className="flex gap-2">
                  <button
                     onClick={() =>
                        updateSearchParams('page', (page - 1).toString())
                     }
                     disabled={page <= 1}
                     className="p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                     onClick={() =>
                        updateSearchParams('page', (page + 1).toString())
                     }
                     disabled={page >= pagination.totalPages}
                     className="p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         )}

         {/* Order Detail Modal */}
         {selectedOrder && (
            <OrderDetailModal
               order={selectedOrder}
               onClose={() => setSelectedOrder(null)}
               onStatusUpdate={handleStatusUpdate}
               onViewPayment={() => setShowPaymentModal(true)}
            />
         )}

         {/* Payment Screenshot Modal */}
         {showPaymentModal && selectedOrder?.paymentScreenshotUrl && (
            <PaymentModal
               imageUrl={selectedOrder.paymentScreenshotUrl}
               onClose={() => setShowPaymentModal(false)}
            />
         )}
      </div>
   );
}

function OrderCard({
   order,
   onView,
   onStatusUpdate,
}: {
   order: Order;
   onView: () => void;
   onStatusUpdate: (orderId: number, status: string) => void;
}) {
   const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
   };

   return (
      <div className="p-4 bg-card border border-border rounded-lg">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
               <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                     {order.orderNumber}
                  </span>
                  <span
                     className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[order.status]}`}
                  >
                     {order.status}
                  </span>
                  {order.paymentScreenshotUrl && (
                     <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                        Paid
                     </span>
                  )}
               </div>
               <p className="mt-1 font-medium text-foreground">
                  {order.customer.name}
               </p>
               <p className="text-sm text-muted-foreground">
                  {order.customer.phone}
               </p>
               <p className="text-sm text-muted-foreground mt-1">
                  {order.items.length} item(s) • ${order.total.toFixed(2)}
               </p>
            </div>
            <div className="flex items-center gap-2">
               {order.status === 'PENDING' && (
                  <>
                     <button
                        onClick={() => onStatusUpdate(order.id, 'CONFIRMED')}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                     >
                        Confirm
                     </button>
                     <button
                        onClick={() => onStatusUpdate(order.id, 'CANCELLED')}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                     >
                        Cancel
                     </button>
                  </>
               )}
               {order.status === 'CONFIRMED' && (
                  <button
                     onClick={() => onStatusUpdate(order.id, 'COMPLETED')}
                     className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                  >
                     Complete
                  </button>
               )}
               <button
                  onClick={onView}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
               >
                  <Eye className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
   );
}

function OrderDetailModal({
   order,
   onClose,
   onStatusUpdate,
   onViewPayment,
}: {
   order: Order;
   onClose: () => void;
   onStatusUpdate: (orderId: number, status: string) => void;
   onViewPayment: () => void;
}) {
   const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
   };

   return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
         <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
               <div>
                  <h2 className="text-lg font-semibold text-foreground">
                     Order {order.orderNumber}
                  </h2>
                  <span
                     className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${statusColors[order.status]}`}
                  >
                     {order.status}
                  </span>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-md"
               >
                  ✕
               </button>
            </div>
            <div className="p-4 space-y-4">
               {/* Customer Info */}
               <div>
                  <h3 className="font-medium text-foreground mb-2">Customer</h3>
                  <p className="text-sm text-muted-foreground">
                     {order.customer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                     {order.customer.phone}
                  </p>
               </div>

               {/* Order Items */}
               <div>
                  <h3 className="font-medium text-foreground mb-2">Items</h3>
                  <div className="space-y-2">
                     {order.items.map((item, index) => (
                        <div
                           key={index}
                           className="flex justify-between text-sm"
                        >
                           <span className="text-muted-foreground">
                              {item.menuItem.name} x{item.qty}
                           </span>
                           <span className="text-foreground">
                              ${item.subtotal.toFixed(2)}
                           </span>
                        </div>
                     ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-border flex justify-between font-medium">
                     <span className="text-foreground">Total</span>
                     <span className="text-foreground">
                        ${order.total.toFixed(2)}
                     </span>
                  </div>
               </div>

               {/* Note */}
               {order.note && (
                  <div>
                     <h3 className="font-medium text-foreground mb-2">Note</h3>
                     <p className="text-sm text-muted-foreground">
                        {order.note}
                     </p>
                  </div>
               )}

               {/* Payment */}
               {order.paymentScreenshotUrl && (
                  <div>
                     <h3 className="font-medium text-foreground mb-2">
                        Payment
                     </h3>
                     <button
                        onClick={onViewPayment}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                     >
                        <Image className="w-4 h-4" />
                        View Payment Screenshot
                     </button>
                  </div>
               )}

               {/* Status Actions */}
               <div className="pt-4 border-t border-border">
                  <h3 className="font-medium text-foreground mb-2">
                     Update Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {order.status === 'PENDING' && (
                        <>
                           <button
                              onClick={() =>
                                 onStatusUpdate(order.id, 'CONFIRMED')
                              }
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                           >
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Confirm
                           </button>
                           <button
                              onClick={() =>
                                 onStatusUpdate(order.id, 'CANCELLED')
                              }
                              className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                           >
                              <XCircle className="w-4 h-4 inline mr-1" />
                              Cancel
                           </button>
                        </>
                     )}
                     {order.status === 'CONFIRMED' && (
                        <button
                           onClick={() => onStatusUpdate(order.id, 'COMPLETED')}
                           className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                        >
                           <CheckCircle className="w-4 h-4 inline mr-1" />
                           Complete
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function PaymentModal({
   imageUrl,
   onClose,
}: {
   imageUrl: string;
   onClose: () => void;
}) {
   return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
         <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
               <h2 className="text-lg font-semibold text-foreground">
                  Payment Screenshot
               </h2>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-md"
               >
                  ✕
               </button>
            </div>
            <div className="p-4">
               <img
                  src={imageUrl}
                  alt="Payment Screenshot"
                  className="w-full h-auto rounded-lg"
               />
            </div>
         </div>
      </div>
   );
}
