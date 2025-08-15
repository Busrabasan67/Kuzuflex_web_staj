import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi';

const AdminResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [email, setEmail] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  // Token validasyonu
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setMessage('Geçersiz şifre sıfırlama bağlantısı');
        setMessageType('error');
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/validate-reset-token/${token}`);
        const data = await response.json();

        if (response.ok) {
          setIsValidToken(true);
          setEmail(data.email);
        } else {
          setMessage(data.message || 'Geçersiz veya süresi dolmuş bağlantı');
          setMessageType('error');
        }
      } catch (error) {
        setMessage('Bağlantı hatası oluştu');
        setMessageType('error');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage('Tüm alanları doldurun');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Şifre en az 6 karakter olmalıdır');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Şifre başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...');
        setMessageType('success');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
      } else {
        setMessage(data.message || 'Şifre sıfırlanamadı');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading durumu
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Bağlantı doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Geçersiz token durumu
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col items-center border border-red-200">
          <div className="bg-red-100 p-4 rounded-full mb-6">
            <FiAlertCircle className="text-red-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-700 text-center">Geçersiz Bağlantı</h2>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <div className="space-y-3 w-full">
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
            >
              Giriş Sayfasına Dön
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col items-center border border-blue-100"
      >
        <div className="bg-blue-100 p-4 rounded-full mb-6">
          <FiLock className="text-blue-600 text-3xl" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Şifre Sıfırla</h2>
        <p className="mb-2 text-gray-500 text-center">Hesabınız için yeni şifre belirleyin</p>
        <p className="mb-8 text-sm text-gray-400 text-center">({email})</p>

        {message && (
          <div className={`w-full mb-6 flex items-center justify-center ${
            messageType === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow border ${
              messageType === 'success' 
                ? 'bg-green-100 border-green-300' 
                : 'bg-red-100 border-red-300'
            }`}>
              {messageType === 'success' ? (
                <FiCheck className="flex-shrink-0" />
              ) : (
                <FiAlertCircle className="flex-shrink-0" />
              )}
              <span className="font-semibold text-sm">{message}</span>
            </div>
          </div>
        )}

        <div className="w-full mb-5 relative">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Şifre
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Yeni şifrenizi girin"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              autoFocus
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="w-full mb-8 relative">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Şifre Tekrarı
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Şifre gereksinimleri */}
        <div className="w-full mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-medium mb-2">Şifre gereksinimleri:</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li className={`flex items-center space-x-2 ${newPassword.length >= 6 ? 'text-green-600' : ''}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-600' : 'bg-blue-400'}`}></span>
              <span>En az 6 karakter</span>
            </li>
            <li className={`flex items-center space-x-2 ${newPassword === confirmPassword && newPassword ? 'text-green-600' : ''}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${newPassword === confirmPassword && newPassword ? 'bg-green-600' : 'bg-blue-400'}`}></span>
              <span>Şifreler eşleşmeli</span>
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold text-lg shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Şifre Sıfırlanıyor...</span>
            </div>
          ) : (
            'Şifremi Sıfırla'
          )}
        </button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/admin-login')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
          >
            ← Giriş sayfasına dön
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminResetPassword;
