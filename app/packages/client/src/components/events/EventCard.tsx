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
   color: string;
   glow: string;
} {
   if (!preOrderClose)
      return {
         label: 'Open',
         color: 'bg-emerald-500',
         glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      };
   const now = new Date();
   const closeDate = new Date(preOrderClose);
   const diffMs = closeDate.getTime() - now.getTime();
   const diffHours = diffMs / (1000 * 60 * 60);

   if (diffHours < 0) {
      return {
         label: 'Closed',
         color: 'bg-red-500',
         glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      };
   } else if (diffHours <= 24) {
      return {
         label: 'Closing Soon',
         color: 'bg-amber-500',
         glow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      };
   }
   return {
      label: 'Open',
      color: 'bg-emerald-500',
      glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
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
      <div className="group rounded-2xl border border-border/60 overflow-hidden bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:scale-[1.02] flex flex-col">
         {/* ── Banner ── */}
         <div className="relative h-52 overflow-hidden">
            {/* Background image */}
            {event.iconUrl ? (
               <img
                  src={event.iconUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
               />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent" />
            )}

            {/* Multi-layer gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10" />
            {/* Subtle shimmer on hover */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />

            {/* ── Date badge (frosted glass) ── */}
            <div className="absolute top-3 left-3 backdrop-blur-md bg-white/90 dark:bg-black/60 rounded-xl shadow-xl border border-white/40 px-3 py-2.5 text-center min-w-[56px]">
               <div className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
                  {dayNum}
               </div>
               <div className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mt-1">
                  {month}
               </div>
            </div>

            {/* ── Status badge (glowing) ── */}
            <div className="absolute top-3 right-3">
               <span
                  className={`${status.color} ${status.glow} text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm tracking-wide uppercase`}
               >
                  {status.label}
               </span>
            </div>

            {/* ── Title overlaid on banner bottom ── */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
               <h3 className="text-xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                  {event.name}
               </h3>
            </div>

            {/* Decorative bottom wave */}
            <svg
               className="absolute bottom-0 left-0 right-0 w-full h-6 text-card"
               viewBox="0 0 400 24"
               preserveAspectRatio="none"
            >
               <path
                  d="M0,24 L0,12 Q100,0 200,12 Q300,24 400,12 L400,24 Z"
                  fill="currentColor"
               />
            </svg>
         </div>

         {/* ── Card body ── */}
         <div className="p-5 pt-3 flex flex-col flex-1">
            {/* Event date */}
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
               <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
               </div>
               <span className="font-medium">{fullDate}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 mt-2.5 text-sm text-muted-foreground">
               <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
               </div>
               <span>{event.location}</span>
            </div>

            {/* Pre-order closing date */}
            {preOrderCloseFormatted && (
               <div className="flex items-center gap-2.5 mt-2.5 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                     <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>Pre-order closes: {preOrderCloseFormatted}</span>
               </div>
            )}

            {/* Info */}
            {event.eventInfo && (
               <div className="flex items-start gap-2.5 mt-3 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                     <Info className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="line-clamp-2 leading-relaxed">
                     {event.eventInfo}
                  </p>
               </div>
            )}

            {/* Hosted by */}
            {event.hostedBy && (
               <div className="flex items-center gap-2.5 mt-3 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                     <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>
                     Hosted by{' '}
                     <span className="font-semibold text-foreground">
                        {event.hostedBy}
                     </span>
                  </span>
               </div>
            )}

            {/* Spacer to push buttons to bottom */}
            <div className="flex-1" />

            {/* ── Buttons ── */}
            <div className="flex gap-3 mt-5">
               <Link
                  to={`/events/${event.id}/order`}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
               >
                  <Utensils className="w-4 h-4" />
                  View Menu
               </Link>
               <Link
                  to={`/events/${event.id}`}
                  className="flex-1 flex items-center justify-center gap-2 border border-border py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/80 hover:border-primary/30 transition-all duration-300"
               >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
               </Link>
            </div>
         </div>
      </div>
   );
}
