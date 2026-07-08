import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavLayout from './components/layout/NavLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MenuOrderingPage from './pages/MenuOrderingPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentUploadPage from './pages/PaymentUploadPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import ChatBot from './components/chat/ChatBot';

export default function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route element={<NavLayout />}>
               <Route path="/" element={<HomePage />} />
               <Route path="/about" element={<AboutPage />} />
               <Route path="/events" element={<EventsPage />} />
               <Route path="/events/:eventId" element={<EventDetailPage />} />
               <Route
                  path="/events/:eventId/order"
                  element={<MenuOrderingPage />}
               />
               <Route path="/checkout" element={<CheckoutPage />} />
               <Route path="/payment-upload" element={<PaymentUploadPage />} />
               <Route
                  path="/order-confirmation"
                  element={<OrderConfirmationPage />}
               />
               <Route path="/contact" element={<ContactPage />} />
            </Route>
            <Route path="/chat" element={<ChatBot />} />
         </Routes>
      </BrowserRouter>
   );
}
