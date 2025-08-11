// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("adminToken");
  });
  
  const isInitializedRef = useRef(false);
  const adminRouteRef = useRef(false);

  // Token validasyonu
  const validateToken = useCallback(async () => {
    const storedToken = localStorage.getItem("adminToken");
    
    if (!storedToken) {
      setToken(null);
      return false;
    }

    try {
      const response = await fetch('/api/auth/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem("adminToken");
        setToken(null);
        navigate("/admin-login", { replace: true });
        return false;
      }
      return true;
    } catch (error) {
      localStorage.removeItem("adminToken");
      setToken(null);
      navigate("/admin-login", { replace: true });
      return false;
    }
  }, [navigate]);

  // Güvenli logout fonksiyonu
  const secureLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setToken(null);
    adminRouteRef.current = false;
    
    // History'yi tamamen temizle
    window.history.pushState(null, '', '/admin-login');
    window.history.replaceState(null, '', '/admin-login');
    
    navigate("/admin-login", { replace: true });
  }, [navigate]);

  // Admin route kontrolü
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      adminRouteRef.current = true;
    } else {
      adminRouteRef.current = false;
    }
  }, [location.pathname]);

  // Ana useEffect - sadece bir kez çalışır
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // İlk yüklemede token varsa validasyon yap
    if (token) {
      validateToken();
    }

    // Geri tuşuna basınca kesinlikle logout yap
    const handlePopState = (event: PopStateEvent) => {
      // Admin route'da geri tuşuna basıldığında
      if (adminRouteRef.current && token) {
        event.preventDefault();
        event.stopPropagation();
        
        // Hemen güvenli logout
        secureLogout();
        
        // History'yi daha da güvenli hale getir
        setTimeout(() => {
          window.history.pushState(null, '', '/admin-login');
          window.history.replaceState(null, '', '/admin-login');
        }, 100);
      }
    };

    // Sayfa focus olduğunda admin route kontrolü
    const handleFocus = () => {
      if (adminRouteRef.current && token) {
        // Admin route'da focus olduğunda token kontrolü
        validateToken();
      }
    };

    // Visibility change - sekme değişimi
    const handleVisibilityChange = () => {
      if (!document.hidden && adminRouteRef.current && token) {
        // Admin route'da sekme aktif olduğunda token kontrolü
        validateToken();
      }
    };

    // Beforeunload - sayfa kapatılmadan önce
    const handleBeforeUnload = () => {
      if (adminRouteRef.current && token) {
        // Admin route'da sayfa kapatılmadan önce token temizle
        localStorage.removeItem("adminToken");
      }
    };

    // Event listener'ları ekle
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Boş dependency array

  // Token değiştiğinde localStorage güncelle
  useEffect(() => {
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  // Login fonksiyonu
  const login = useCallback((newToken: string) => {
    setToken(newToken);
    adminRouteRef.current = true;
    
    // Admin route'a giriş yapıldığında history'yi güvenli hale getir
    window.history.pushState({ adminRoute: true, timestamp: Date.now() }, '', '/admin');
    
    navigate("/admin", { replace: true });
  }, [navigate]);

  // Logout fonksiyonu
  const logout = useCallback(() => {
    secureLogout();
  }, [secureLogout]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
