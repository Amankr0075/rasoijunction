import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';

// Route Guards
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';

// Auth Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import MaintenancePage from './features/maintenance/MaintenancePage';

// Customer Pages
import HomePage from './features/customer/HomePage';
import CustomerDashboard from './features/customer/CustomerDashboard';
import MenuPage from './features/menu/MenuPage';
import CartPage from './features/cart/CartPage';
import OrderTrackingPage from './features/orders/OrderTrackingPage';
import ReservationPage from './features/reservations/ReservationPage';
import PaymentSimulationPage from './features/cart/PaymentSimulationPage';
import InvoicePage from './features/orders/InvoicePage';
import ReviewsPage from './features/customer/ReviewsPage';
import WishlistPage from './features/customer/WishlistPage';
import SettingsPage from './features/customer/SettingsPage';
import CustomerFeedbackPage from './features/customer/CustomerFeedbackPage';
import AboutPage from './features/public/AboutPage';
import ContactPage from './features/public/ContactPage';
import FAQPage from './features/public/FAQPage';
import PrivacyPolicyPage from './features/public/PrivacyPolicyPage';
import TermsOfServicePage from './features/public/TermsOfServicePage';
import RefundPolicyPage from './features/public/RefundPolicyPage';

// Admin Pages
import AdminDashboard from './features/admin/AdminDashboard';
import AdminMenuManagement from './features/menu/AdminMenuManagement';
import AdminOrderManagement from './features/orders/AdminOrderManagement';
import AdminReservations from './features/reservations/AdminReservations';
import AdminPayments from './features/admin/AdminPayments';
import AdminManagementConsole from './features/admin/AdminManagementConsole';

// Kitchen
import KitchenDashboard from './features/kitchen/KitchenDashboard';

// Staff
import StaffDashboard from './features/staff/StaffDashboard';

// Delivery
import DeliveryDashboard from './features/delivery/DeliveryDashboard';

// Error Pages
import NotFoundPage from './components/common/NotFoundPage';
import UnauthorizedPage from './components/common/UnauthorizedPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #1e293b)',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* ─── Public Routes ─────────────────────────────── */}
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Customer-facing (with Navbar + Footer) */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <HomePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/menu"
              element={
                <CustomerLayout>
                  <MenuPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/about"
              element={
                <CustomerLayout>
                  <AboutPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <CustomerLayout>
                  <ContactPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/faq"
              element={
                <CustomerLayout>
                  <FAQPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <CustomerLayout>
                  <PrivacyPolicyPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/terms-of-service"
              element={
                <CustomerLayout>
                  <TermsOfServicePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/refund-policy"
              element={
                <CustomerLayout>
                  <RefundPolicyPage />
                </CustomerLayout>
              }
            />

            <Route
              path="/reservations"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer', 'manager', 'admin', 'staff', 'delivery', 'chef']}>
                    <CustomerLayout>
                      <ReservationPage />
                    </CustomerLayout>
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* ─── Customer Routes ───────────────────────────── */}
            <Route
              path="/customer/dashboard"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <CustomerDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <CustomerDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/reservations"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <CustomerLayout>
                      <ReservationPage />
                    </CustomerLayout>
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/reviews"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <ReviewsPage />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/wishlist"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <WishlistPage />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/payments"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <CustomerDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/settings"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <SettingsPage />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/feedback"
              element={
                <PrivateRoute>
                  <CustomerFeedbackPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout/payment"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <CustomerLayout>
                      <PaymentSimulationPage />
                    </CustomerLayout>
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/invoice/:orderId"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer', 'admin', 'manager']}>
                    <CustomerLayout>
                      <InvoicePage />
                    </CustomerLayout>
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id/track"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['customer']}>
                    <CustomerLayout>
                      <OrderTrackingPage />
                    </CustomerLayout>
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* ─── Admin/Manager/Staff Routes ────────────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <PrivateRoute>
                  <StaffDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <PrivateRoute>
                  <AdminMenuManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute>
                  <AdminOrderManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/orders"
              element={
                <PrivateRoute>
                  <AdminOrderManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <PrivateRoute>
                  <AdminReservations />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/reservations"
              element={
                <PrivateRoute>
                  <AdminReservations />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/reviews"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="reviews" />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <PrivateRoute>
                  <AdminPayments />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="inventory" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="customers" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="staff" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="coupons" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="reports" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="reviews" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <PrivateRoute>
                  <AdminManagementConsole defaultTab="notifications" />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            {/* ─── Kitchen Routes ─────────────────────────────── */}
            <Route
              path="/kitchen/dashboard"
              element={
                <PrivateRoute>
                  <KitchenDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/kitchen/queue"
              element={
                <PrivateRoute>
                  <KitchenDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/kitchen/orders"
              element={
                <PrivateRoute>
                  <KitchenDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/kitchen/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            {/* ─── Delivery Routes ────────────────────────────── */}
            <Route
              path="/delivery/dashboard"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['delivery', 'admin']}>
                    <DeliveryDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/delivery/orders"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['delivery', 'admin']}>
                    <DeliveryDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/delivery/history"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['delivery', 'admin']}>
                    <DeliveryDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/delivery/settings"
              element={
                <PrivateRoute>
                  <RoleRoute roles={['delivery', 'admin']}>
                    <SettingsPage />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* ─── Error Routes ───────────────────────────────── */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
