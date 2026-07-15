import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { FileText, FileSpreadsheet } from 'lucide-react';
import EventSelector from '@/components/dashboard/EventSelector';

interface Event {
   id: number;
   name: string;
   eventDate: string;
}

export default function ExportPage() {
   const [searchParams] = useSearchParams();
   const [event, setEvent] = useState<Event | null>(null);
   const [loading, setLoading] = useState(true);

   const eventId = searchParams.get('eventId');

   useEffect(() => {
      if (eventId) {
         fetchEvent();
      }
   }, [eventId]);

   const fetchEvent = async () => {
      if (!eventId) return;

      setLoading(true);
      try {
         const response = await api.get(`/events/${eventId}`);
         setEvent(response.data.event);
      } catch (error) {
         console.error('Failed to fetch event:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleExportOrders = async () => {
      if (!eventId) return;
      try {
         const response = await api.get(`/export/${eventId}/orders`, {
            responseType: 'blob',
         });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `orders-event-${eventId}.csv`);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
      } catch (error) {
         console.error('Failed to export orders:', error);
      }
   };

   const handleExportMenu = async () => {
      if (!eventId) return;
      try {
         const response = await api.get(`/export/${eventId}/menu`, {
            responseType: 'blob',
         });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `menu-event-${eventId}.csv`);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
      } catch (error) {
         console.error('Failed to export menu:', error);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Export Data</h1>
            <EventSelector />
         </div>

         {event && (
            <div className="p-4 bg-card border border-border rounded-lg">
               <h2 className="font-semibold text-foreground">{event.name}</h2>
               <p className="text-sm text-muted-foreground">
                  {new Date(event.eventDate).toLocaleDateString()}
               </p>
            </div>
         )}

         {!eventId && (
            <div className="text-center py-12">
               <p className="text-muted-foreground">
                  Select an event above to export data
               </p>
            </div>
         )}

         {eventId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Export Orders */}
               <button
                  onClick={handleExportOrders}
                  className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow text-left"
               >
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-50 rounded-full">
                        <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                     </div>
                     <div>
                        <h3 className="font-semibold text-foreground">
                           Export Orders
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           Download all orders as CSV file
                        </p>
                     </div>
                  </div>
               </button>

               {/* Export Menu */}
               <button
                  onClick={handleExportMenu}
                  className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow text-left"
               >
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-green-50 rounded-full">
                        <FileText className="w-8 h-8 text-green-600" />
                     </div>
                     <div>
                        <h3 className="font-semibold text-foreground">
                           Export Menu
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           Download menu items as CSV file
                        </p>
                     </div>
                  </div>
               </button>
            </div>
         )}
      </div>
   );
}
