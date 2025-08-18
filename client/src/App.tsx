//Tüm uygulamanın kök bileşeni (root component),main.tsx dosyasından çağrılan ilk React bileşeni
  //Ana layout yapısı (header, footer, sidebar) ,Global CSS importları,Routes	Sayfa yönlendirme (<Route path="..." />) tanımlamaları,Router	BrowserRouter gibi routing yapısını saran üst bileşen,App.tsx dosyasında tüm uygulama yapısının kök bileşeni olarak tanımlanır.
 
  import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout"; 
import ProductGroupPage from "./pages/ProductGroupPage";
import SubProductPage from "./pages/SubProductPage";
import SolutionPage from "./pages/SolutionPage";
import AdminProductGroups from "./pages/AdminProductGroups";
import QMDocuments from "./pages/QMDocuments";
import MarketDetail from "./pages/MarketDetail";
import Breadcrumb from "./components/Breadcrumb";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Sayfa değiştiğinde en üste scroll yap
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Normal Sayfalarda Navbar Göster */}
      {!isAdminRoute && <Navbar isAdminLoggedIn={isAuthenticated} />}

      {/* Breadcrumb Component */}
      {!isAdminRoute && <Breadcrumb />}

      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
            {/* Normal Kullanıcı Sayfaları */}
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/hakkimizda" element={<Navigate to="/about-us" replace />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Slug bazlı ürün sayfaları */}
            <Route path="/products/:groupSlug" element={<ProductGroupPage />} />
            <Route path="/products/:groupSlug/:productSlug" element={<SubProductPage />} />
            
            <Route path="/solutions/:slug" element={<SolutionPage />} /> 
            <Route path="/qm-documents" element={<QMDocuments />} />
            <Route path="/markets/:slug" element={<MarketDetail />} />

            {/* Admin Login */}
            <Route
              path="/admin-login"
              element={
                isAuthenticated ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <AdminLogin />
                )
              }
            />

            {/* Admin Reset Password */}
            <Route
              path="/admin-reset-password"
              element={<AdminResetPassword />}
            />

            {/* Admin Panel: Sidebar + LogoutButton'lı Layout içinde */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminPanel />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Product Groups Management */}
            <Route
              path="/admin/product-groups"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminProductGroups />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Eğer başka admin route'ların olacaksa buraya ekleyebilirsin */}
          </Routes>
        </div>

        {/* Normal Sayfalarda Footer Göster */}
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
