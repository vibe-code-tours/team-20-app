import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import NavLayout from './components/layout/NavLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MenuOrderingPage from './pages/MenuOrderingPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentUploadPage from './pages/PaymentUploadPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './pages/admin/AdminLayout';
import InvitationsPage from './pages/admin/InvitationsPage';
import UsersPage from './pages/admin/UsersPage';

export default function App() {
   return (
      <ThemeProvider>
         <BrowserRouter>
            <AuthProvider>
               <Routes>
                  {/* Public routes with navigation */}
                  <Route element={<NavLayout />}>
                     <Route path="/" element={<HomePage />} />
                     <Route path="/about" element={<AboutPage />} />
                     <Route path="/events" element={<EventsPage />} />
                     <Route
                        path="/events/:eventId"
                        element={<EventDetailPage />}
                     />
                     <Route
                        path="/events/:eventId/order"
                        element={<MenuOrderingPage />}
                     />
                     <Route path="/checkout" element={<CheckoutPage />} />
                     <Route
                        path="/payment-upload"
                        element={<PaymentUploadPage />}
                     />
                     <Route
                        path="/order-confirmation"
                        element={<OrderConfirmationPage />}
                     />
                     <Route path="/contact" element={<ContactPage />} />
                  </Route>

                  {/* Auth pages (no layout shell) */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected admin routes */}
                  <Route element={<ProtectedRoute />}>
                     <Route path="/admin" element={<AdminLayout />}>
                        <Route
                           path="invitations"
                           element={<InvitationsPage />}
                        />
                        <Route path="users" element={<UsersPage />} />
                     </Route>
                  </Route>
               </Routes>
            </AuthProvider>
         </BrowserRouter>
      </ThemeProvider>
   );
}
