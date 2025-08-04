//Tüm uygulamanın kök bileşeni (root component),main.tsx dosyasından çağrılan ilk React bileşeni
  //Ana layout yapısı (header, footer, sidebar) ,Global CSS importları,Routes	Sayfa yönlendirme (<Route path="..." />) tanımlamaları,Router	BrowserRouter gibi routing yapısını saran üst bileşen,App.tsx dosyasında tüm uygulama yapısının kök bileşeni olarak tanımlanır.
 
  import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import { ThemeProvider } from "./theme/ThemeContext";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout"; 
import ProductGroupPage from "./pages/ProductGroupPage";
import SubProductPage from "./pages/SubProductPage";
import SolutionPage from "./pages/SolutionPage";
import AdminProductGroups from "./pages/AdminProductGroups";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Normal Sayfalarda Navbar Göster */}
      {!isAdminRoute && <Navbar isAdminLoggedIn={isAuthenticated} />}

      <div className="min-h-screen flex flex-col">
        <div className={`${!isAdminRoute ? 'pt-16' : ''} flex-grow`}>
          <Routes>
            {/* Normal Kullanıcı Sayfaları */}
            <Route path="/" element={<Home />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            
            {/* Slug bazlı ürün sayfaları */}
            <Route path="/products/:groupSlug" element={<ProductGroupPage />} />
            <Route path="/products/:groupSlug/:productSlug" element={<SubProductPage />} />
            
            <Route path="/solutions/:slug" element={<SolutionPage />} /> 


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
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
  );
}

export default App;
