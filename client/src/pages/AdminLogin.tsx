import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const AdminLogin: React.FC= () => {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Sayfa yüklendiğinde history'yi temizle
  useEffect(() => {
    // Eğer zaten authenticate ise admin paneline yönlendir
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
      return;
    }

    // Login sayfasında history'yi temizle ve güvenli hale getir
    window.history.pushState(null, '', '/admin-login');
    window.history.replaceState(null, '', '/admin-login');

    // Geri tuşuna basınca ana sayfaya yönlendir
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      navigate("/", { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // hangi bilgiler gönderiliyor?
    console.log("Gönderilen:", {
      identifier: username,
      password: password
    });
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: username,
          password: password
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Giriş başarısız");
      }

      login(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col items-center border border-blue-100"
      >
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Admin Girişi</h2>
        <p className="mb-8 text-gray-500">Hoş geldiniz! Lütfen giriş yapın.</p>
        {error && (
          <div className="w-full mb-6 flex items-center justify-center">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow animate-shake border border-red-300 font-semibold">
              {error}
            </span>
          </div>
        )}
        <div className="w-full mb-5 relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            autoFocus
          />
        </div>
        <div className="w-full mb-8 relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <FiEyeOff className="text-xl" />
            ) : (
              <FiEye className="text-xl" />
            )}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold text-lg shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
        >
          Giriş Yap
        </button>
        
        {/* Şifremi Unuttum Linki */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
          >
            Şifremi Unuttum
          </button>
        </div>
      </form>
      <button
        onClick={() => navigate("/")}
        className="mt-6 ml-4 px-6 py-2 bg-white/80 border border-blue-300 text-blue-700 rounded-lg shadow hover:bg-blue-50 transition-all duration-200 font-semibold"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        ← Ana Sayfaya Dön
      </button>
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.4s;
        }
      `}</style>
      
      {/* Şifremi Unuttum Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default AdminLogin; 