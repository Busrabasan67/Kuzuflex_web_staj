import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiLock, FiCheck, FiAlertCircle, FiShield, FiX } from 'react-icons/fi';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-400'
  });

  // Şifre gücünü kontrol et
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
      feedback.push('✓ En az 8 karakter');
    } else {
      feedback.push('✗ En az 8 karakter gerekli');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push('✓ Küçük harf');
    } else {
      feedback.push('✗ Küçük harf gerekli');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push('✓ Büyük harf');
    } else {
      feedback.push('✗ Büyük harf gerekli');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
      feedback.push('✓ Sayı');
    } else {
      feedback.push('✗ Sayı gerekli');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
      feedback.push('✓ Özel karakter');
    } else {
      feedback.push('✗ Özel karakter gerekli (., _ ! @ # $ % ^ & *)');
    }

    let color = 'text-red-500';
    if (score >= 4) color = 'text-green-500';
    else if (score >= 3) color = 'text-yellow-500';
    else if (score >= 2) color = 'text-orange-500';

    return { score, feedback, color };
  };

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: 'text-gray-400' });
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
      return;
    }

    if (passwordStrength.score < 4) {
      setMessage({ type: 'error', text: 'Şifre güvenlik kriterlerini karşılamıyor. Lütfen daha güçlü bir şifre seçin.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' });
        return;
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        // Form'u temizle
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Şifre değiştirilemedi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Güvenlik İpuçları */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FiShield className="text-blue-600 text-xl" />
          </div>
          <h4 className="text-lg font-semibold text-blue-900">Güvenlik Kriterleri</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>En az 8 karakter</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Büyük ve küçük harf</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Sayı içermeli</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Özel karakter (., _ ! @ # $ % ^ & *)</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
            <FiLock className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Şifre Değiştir</h3>
            <p className="text-gray-500">Hesap güvenliğiniz için güçlü bir şifre belirleyin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mevcut Şifre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mevcut Şifre
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Mevcut şifrenizi girin"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Yeni Şifre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                  newPassword ? (passwordStrength.score >= 4 ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Yeni şifrenizi girin"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            
            {/* Şifre Gücü Göstergesi */}
            {newPassword && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Şifre Gücü:</span>
                  <span className={`text-sm font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.score >= 4 ? 'Güçlü' : passwordStrength.score >= 3 ? 'Orta' : passwordStrength.score >= 2 ? 'Zayıf' : 'Çok Zayıf'}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4 ? 'bg-green-500' : 
                      passwordStrength.score >= 3 ? 'bg-yellow-500' : 
                      passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                
                {/* Kriterler */}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {passwordStrength.feedback.map((item, index) => (
                    <div key={index} className={`flex items-center space-x-2 ${
                      item.startsWith('✓') ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {item.startsWith('✓') ? <FiCheck size={14} /> : <FiX size={14} />}
                      <span>{item.substring(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Şifre Tekrar */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Yeni Şifre Tekrar
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                  confirmPassword ? (newPassword === confirmPassword ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Yeni şifrenizi tekrar girin"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            
            {/* Şifre Eşleşme Göstergesi */}
            {confirmPassword && (
              <div className={`flex items-center space-x-2 text-sm ${
                newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'
              }`}>
                {newPassword === confirmPassword ? <FiCheck size={16} /> : <FiX size={16} />}
                <span>
                  {newPassword === confirmPassword ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor'}
                </span>
              </div>
            )}
          </div>

          {/* Mesaj */}
          {message && (
            <div className={`p-4 rounded-lg text-sm flex items-start space-x-3 border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {message.type === 'success' ? (
                <FiCheck className="text-green-600 text-lg mt-0.5 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="text-red-600 text-lg mt-0.5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400"
              disabled={isLoading}
            >
              Formu Temizle
            </button>
            <button
              type="submit"
              disabled={isLoading || passwordStrength.score < 4 || newPassword !== confirmPassword}
              className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiLock className="text-lg" />
              <span>{isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
