// ProtectedRoute.tsx , bir sayfaya erişim yetkisi kontrolü yapılır, token geçerliyse sayfaya erişilir, geçersizse login sayfasına yönlendirilir
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde token kontrolü
    if (!token) {
      setIsValidating(false);
      setIsValid(false);
      return;
    }

    // Token'ın geçerliliğini kontrol et
    const checkTokenValidity = async () => {
      try {
        const response = await fetch('/api/auth/validate-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token geçersiz, localStorage'ı temizle
          localStorage.removeItem('adminToken');
          window.location.href = '/admin-login';
          return;
        }

        setIsValid(true);
        setIsValidating(false);
      } catch (error) {
        // Network hatası durumunda da logout
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login';
      }
    };

    checkTokenValidity();

    // Periyodik token kontrolü (her 5 dakikada bir)
    const intervalId = setInterval(checkTokenValidity, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [token]);

  // Eğer authenticate değilse login sayfasına yönlendir
  if (!isAuthenticated || !token) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  // Token validasyonu sırasında loading göster
  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Güvenlik kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  // Token geçersizse login sayfasına yönlendir
  if (!isValid) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
