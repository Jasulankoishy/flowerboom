import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink text-white-alt">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-sky border-t-transparent" />
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-slate-500">Загрузка</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, user, isAdmin } = useAuthStore();

  if (isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAuthenticated || !accessToken || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, isAdmin } = useAuthStore();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:idOrSlug" element={<ProductPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
