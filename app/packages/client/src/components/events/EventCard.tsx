import { Link } from 'react-router-dom';
import {
   Calendar,
   MapPin,
   Clock,
   Info,
   User,
   ArrowRight,
   Utensils,
} from 'lucide-react';

export type EventCardData = {
   id: number;
   name: string;
   eventInfo: string | null;
   iconUrl: string | null;
   hostedBy: string | null;
   eventDate: string;
   location: string;
   preOrderClose: string | null;
};

function getStatus(preOrderClose: string | null): {
   label: string;
   dot: string;
   text: string;
   border: string;
} {
   if (!preOrderClose)
      return {
         label: 'Open',
         dot: 'bg-emerald-400',
         text: 'text-emerald-700 dark:text-emerald-300',
         border: 'border-emerald-400/30',
      };
   const now = new Date();
   const closeDate = new Date(preOrderClose);
   const diffMs = closeDate.getTime() - now.getTime();
   const diffHours = diffMs / (1000 * 60 * 60);

   if (diffHours < 0) {
      return {
         label: 'Closed',
         dot: 'bg-red-400',
         text: 'text-red-700 dark:text-red-300',
         border: 'border-red-400/30',
      };
   } else if (diffHours <= 24) {
      return {
         label: 'Closing Soon',
         dot: 'bg-amber-400',
         text: 'text-amber-700 dark:text-amber-300',
         border: 'border-amber-400/30',
      };
   }
   return {
      label: 'Open',
      dot: 'bg-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-400/30',
   };
}

export default function EventCard({ event }: { event: EventCardData }) {
   const date = new Date(event.eventDate);
   const dayNum = date.getDate();
   const month = date
      .toLocaleDateString('en-NZ', { month: 'short' })
      .toUpperCase();
   const fullDate = date.toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   });
   const status = getStatus(event.preOrderClose);

   const preOrderCloseFormatted = event.preOrderClose
      ? new Date(event.preOrderClose).toLocaleDateString('en-NZ', {
           weekday: 'long',
           day: 'numeric',
           month: 'long',
           year: 'numeric',
        })
      : null;

   return (
      <div className="group rounded-2xl overflow-hidden bg-card border border-border/40 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 hover:scale-[1.015] flex flex-col">
         {/* ── Luxury Banner ── */}
         <div className="relative h-56 overflow-hidden">
            {/* Background image */}
            {event.iconUrl ? (
               <img
                  src={event.iconUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms] ease-out"
               />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
            )}

            {/* Luxury dark overlay — rich vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
            {/* Subtle vignette edges */}
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.4)]" />

            {/* ── Date badge — elegant glass with gold accent ── */}
            <div className="absolute top-4 left-4 backdrop-blur-xl bg-white/80 dark:bg-white/10 rounded-2xl shadow-2xl border border-white/50 dark:border-white/20 px-3.5 py-3 text-center min-w-[60px]">
               <div className="text-[28px] font-black text-gray-900 dark:text-white leading-none tracking-tight">
                  {dayNum}
               </div>
               <div className="text-[10px] font-bold text-[#C9A96E] uppercase tracking-[0.2em] mt-1.5">
                  {month}
               </div>
            </div>

            {/* ── Status badge — refined pill ── */}
            <div className="absolute top-4 right-4">
               <span
                  className={`inline-flex items-center gap-1.5 backdrop-blur-md bg-white/80 dark:bg-black/50 ${status.text} ${status.border} border text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide`}
               >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
               </span>
            </div>

            {/* ── Title + subtitle area at bottom ── */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
               {/* Gold accent line */}
               <div className="mx-5 mb-3 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/60 to-transparent" />

               <div className="px-5 pb-5">
                  <h3 className="text-[22px] font-bold text-white leading-tight tracking-tight line-clamp-2 drop-shadow-md">
                     {event.name}
                  </h3>
               </div>
            </div>
         </div>

         {/* ── Card body ── */}
         <div className="p-5 pt-4 flex flex-col flex-1">
            {/* Event date */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
               <Calendar className="w-4 h-4 shrink-0 text-[#C9A96E]" />
               <span className="font-medium">{fullDate}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 mt-2.5 text-sm text-muted-foreground">
               <MapPin className="w-4 h-4 shrink-0 text-[#C9A96E]" />
               <span>{event.location}</span>
            </div>

            {/* Pre-order closing date */}
            {preOrderCloseFormatted && (
               <div className="flex items-center gap-3 mt-2.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0 text-[#C9A96E]" />
                  <span>Pre-order closes: {preOrderCloseFormatted}</span>
               </div>
            )}

            {/* Info */}
            {event.eventInfo && (
               <div className="flex items-start gap-3 mt-3 text-sm text-muted-foreground">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A96E]" />
                  <p className="line-clamp-2 leading-relaxed">
                     {event.eventInfo}
                  </p>
               </div>
            )}

            {/* Hosted by */}
            {event.hostedBy && (
               <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                  <User className="w-4 h-4 shrink-0 text-[#C9A96E]" />
                  <span>
                     Hosted by{' '}
                     <span className="font-semibold text-foreground">
                        {event.hostedBy}
                     </span>
                  </span>
               </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* ── Buttons ── */}
            <div className="flex gap-3 mt-5">
               <Link
                  to={`/events/${event.id}/order`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A96E] to-[#B8945F] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#C9A96E]/20 hover:shadow-lg hover:shadow-[#C9A96E]/30 hover:brightness-110 transition-all duration-300"
               >
                  <Utensils className="w-4 h-4" />
                  View Menu
               </Link>
               <Link
                  to={`/events/${event.id}`}
                  className="flex-1 flex items-center justify-center gap-2 border border-[#C9A96E]/30 text-[#C9A96E] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C9A96E]/10 hover:border-[#C9A96E]/50 transition-all duration-300"
               >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
               </Link>
            </div>
         </div>
      </div>
   );
}
