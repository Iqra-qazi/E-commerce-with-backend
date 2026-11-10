import { lazy, Suspense } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { AdminLayout } from "./components/AdminLayout";

const AdminProductsPage = lazy(() =>
  import("./pages/AdminProductsPage").then((module) => ({ default: module.AdminProductsPage })),
);
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })),
);
const AdminNotificationsPage = lazy(() =>
  import("./pages/AdminNotificationsPage").then((module) => ({ default: module.AdminNotificationsPage })),
);
const AdminOrdersPage = lazy(() =>
  import("./pages/AdminOrdersPage").then((module) => ({ default: module.AdminOrdersPage })),
);
const AdminOrderDetailPage = lazy(() =>
  import("./pages/AdminOrderDetailPage").then((module) => ({ default: module.AdminOrderDetailPage })),
);
const CartPage = lazy(() =>
  import("./pages/CartPage").then((module) => ({ default: module.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("./pages/CheckoutPage").then((module) => ({ default: module.CheckoutPage })),
);
const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const MyOrdersPage = lazy(() =>
  import("./pages/MyOrdersPage").then((module) => ({ default: module.MyOrdersPage })),
);
const ProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage })),
);
const ProductsPage = lazy(() =>
  import("./pages/ProductsPage").then((module) => ({ default: module.ProductsPage })),
);
const OrderSuccessPage = lazy(() =>
  import("./pages/OrderSuccessPage").then((module) => ({ default: module.OrderSuccessPage })),
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((module) => ({ default: module.SignupPage })),
);

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <MotionConfig reducedMotion="user">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="app-page-transition min-h-screen"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={location.pathname}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-stone-500">Loading page…</div>}>
              <Routes location={location}>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                </Route>
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
