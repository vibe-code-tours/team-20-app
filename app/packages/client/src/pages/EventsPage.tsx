import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

type Event = {
   id: number;
   name: string;
   eventInfo: string | null;
   iconUrl: string | null;
   hostedBy: string | null;
   eventDate: string;
   location: string;
   preOrderClose: string | null;
};

const badgeColors = [
   'bg-rose-600',
   'bg-sky-600',
   'bg-emerald-600',
   'bg-amber-600',
   'bg-violet-600',
   'bg-teal-600',
   'bg-orange-600',
   'bg-indigo-600',
];

type Filter = 'all' | 'upcoming' | 'past';

export default function EventsPage() {
   const [events, setEvents] = useState<Event[]>([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState<Filter>('upcoming');

   useEffect(() => {
      const endpoint =
         filter === 'upcoming' ? '/api/events/active' : '/api/events';
      setLoading(true);
      axios
         .get(endpoint)
         .then((res) => {
            const data =
               filter === 'upcoming' ? res.data.activeEvents : res.data.events;
            setEvents(data);
         })
         .catch(() => setEvents([]))
         .finally(() => setLoading(false));
   }, [filter]);

   const now = new Date();
   const displayEvents =
      filter === 'past'
         ? events.filter((e) => new Date(e.eventDate) < now)
         : events;

   return (
      <div className="max-w-6xl mx-auto px-4 py-12">
         <h1 className="text-4xl font-bold mb-2">Events</h1>
         <p className="text-muted-foreground mb-8">
            Browse upcoming and past fundraising events.
         </p>

         {/* Filter tabs */}
         <div className="flex gap-2 mb-8">
            {(
               [
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'past', label: 'Past Events' },
                  { key: 'all', label: 'All' },
               ] as const
            ).map((tab) => (
               <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     filter === tab.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
               >
                  {tab.label}
               </button>
            ))}
         </div>

         {/* Events grid */}
         {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                  <div
                     key={i}
                     className="rounded-xl border border-border overflow-hidden animate-pulse"
                  >
                     <div className="h-12 bg-muted" />
                     <div className="p-5 space-y-3">
                        <div className="h-4 bg-muted rounded w-20" />
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                     </div>
                  </div>
               ))}
            </div>
         ) : displayEvents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
               <p className="text-muted-foreground">
                  {filter === 'upcoming'
                     ? 'No upcoming events at the moment. Check back soon!'
                     : 'No events found.'}
               </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {displayEvents.map((event, index) => {
                  const date = new Date(event.eventDate);
                  const dayNum = date.getDate();
                  const month = date.toLocaleDateString('en-NZ', {
                     month: 'short',
                  });
                  const weekday = date.toLocaleDateString('en-NZ', {
                     weekday: 'long',
                  });
                  const color = badgeColors[index % badgeColors.length]!;
                  const isPast = date < now;

                  return (
                     <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className={`group block rounded-xl border border-border overflow-visible hover:shadow-lg transition-shadow ${
                           event.iconUrl ? 'mb-7' : ''
                        } ${isPast ? 'opacity-60' : ''}`}
                     >
                        {/* Date badge */}
                        <div
                           className={`${color} text-white px-5 py-3 flex items-baseline gap-2 rounded-t-xl`}
                        >
                           <span className="text-3xl font-bold leading-none">
                              {dayNum}
                           </span>
                           <span className="text-sm font-medium uppercase tracking-wide">
                              {month}
                           </span>
                        </div>

                        {/* Card body */}
                        <div
                           className={`text-center ${event.iconUrl ? 'pt-5 pb-14' : 'p-5'} relative`}
                        >
                           <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              {weekday}
                           </p>
                           <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {event.name}
                           </h3>
                           <p className="text-sm text-muted-foreground mt-1">
                              {event.location}
                           </p>
                           {event.hostedBy && (
                              <p className="text-xs text-primary font-medium mt-1">
                                 Hosted by {event.hostedBy}
                              </p>
                           )}
                           {event.preOrderClose && (
                              <p className="text-xs text-muted-foreground mt-2">
                                 Pre-order closes{' '}
                                 {new Date(
                                    event.preOrderClose
                                 ).toLocaleDateString('en-NZ', {
                                    month: 'short',
                                    day: 'numeric',
                                 })}
                              </p>
                           )}

                           {/* Icon overlapping bottom */}
                           {event.iconUrl && (
                              <div className="absolute left-1/2 -bottom-7 -translate-x-1/2">
                                 <img
                                    src={event.iconUrl}
                                    alt=""
                                    className="w-14 h-14 rounded-xl border-2 border-border object-cover shadow-md"
                                 />
                              </div>
                           )}
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
