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

export default function HomePage() {
   const [events, setEvents] = useState<Event[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      axios
         .get('/api/events/active')
         .then((res) => setEvents(res.data.activeEvents))
         .catch(() => setEvents([]))
         .finally(() => setLoading(false));
   }, []);

   return (
      <div>
         {/* Hero */}
         <section className="bg-muted">
            <div className="max-w-6xl mx-auto px-4 py-20 text-center">
               <h1 className="text-5xl font-bold mb-4">
                  Order delicious food for community fundraising events
               </h1>
               <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Browse upcoming events, select your favourite menu items, and
                  place your order — all in one place.
               </p>
               <div className="flex items-center justify-center gap-4">
                  <Link
                     to="/events"
                     className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                     Browse Events
                  </Link>
                  <a
                     href="#how-it-works"
                     className="border border-border px-6 py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                     Learn More
                  </a>
               </div>
            </div>
         </section>

         {/* Active Events */}
         <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold mb-8">Upcoming Events</h2>

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
            ) : events.length === 0 ? (
               <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">
                     No upcoming events at the moment. Check back soon!
                  </p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => {
                     const date = new Date(event.eventDate);
                     const dayNum = date.getDate();
                     const month = date.toLocaleDateString('en-NZ', {
                        month: 'short',
                     });
                     const weekday = date.toLocaleDateString('en-NZ', {
                        weekday: 'long',
                     });
                     const color = badgeColors[index % badgeColors.length]!;

                     return (
                        <Link
                           key={event.id}
                           to={`/events/${event.id}`}
                           className={`group block rounded-xl border border-border overflow-visible hover:shadow-lg transition-shadow ${
                              event.iconUrl ? 'mb-7' : ''
                           }`}
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
         </section>

         {/* How It Works */}
         <section id="how-it-works" className="bg-muted">
            <div className="max-w-6xl mx-auto px-4 py-16">
               <h2 className="text-2xl font-bold mb-8 text-center">
                  How It Works
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                     <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-3">
                        1
                     </div>
                     <h3 className="font-semibold mb-1">Browse Events</h3>
                     <p className="text-sm text-muted-foreground">
                        Find upcoming fundraising events and view available menu
                        items.
                     </p>
                  </div>
                  <div className="text-center">
                     <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-3">
                        2
                     </div>
                     <h3 className="font-semibold mb-1">Select & Order</h3>
                     <p className="text-sm text-muted-foreground">
                        Choose your favourite dishes and place your order in
                        minutes.
                     </p>
                  </div>
                  <div className="text-center">
                     <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-3">
                        3
                     </div>
                     <h3 className="font-semibold mb-1">Upload & Confirm</h3>
                     <p className="text-sm text-muted-foreground">
                        Upload your payment screenshot and receive order
                        confirmation.
                     </p>
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
}
