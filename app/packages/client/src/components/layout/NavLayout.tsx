import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinks = [
   { to: '/', label: 'Home' },
   { to: '/about', label: 'About Us' },
   { to: '/events', label: 'Events' },
   { to: '/contact', label: 'Contact' },
];

export default function NavLayout() {
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
   }, []);

   return (
      <div className="min-h-screen flex flex-col">
         <header
            className={`sticky top-0 z-50 border-b border-border bg-card transition-all duration-300 ${
               scrolled ? 'shadow-sm' : ''
            }`}
         >
            <nav
               className={`max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${
                  scrolled ? 'h-16' : 'h-24'
               }`}
            >
               <Link to="/" className="flex items-center">
                  <img
                     src="/icons.svg"
                     alt="Logo"
                     className={`rounded-full border-2 border-border transition-all duration-300 ${
                        scrolled ? 'h-12' : 'h-20'
                     }`}
                  />
               </Link>
               <ul className="flex items-center gap-6">
                  {navLinks.map((link) => (
                     <li key={link.to}>
                        <NavLink
                           to={link.to}
                           end={link.to === '/'}
                           className={({ isActive }) =>
                              `text-sm transition-colors ${
                                 isActive
                                    ? 'text-foreground font-medium'
                                    : 'text-muted-foreground hover:text-foreground'
                              }`
                           }
                        >
                           {link.label}
                        </NavLink>
                     </li>
                  ))}
               </ul>
            </nav>
         </header>

         <main className="flex-1">
            <Outlet />
         </main>

         <footer className="border-t border-border bg-card py-6">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
               &copy; {new Date().getFullYear()} Team20 - Vibe Code Tour. All
               rights reserved.
            </div>
         </footer>
      </div>
   );
}
