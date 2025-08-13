import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, TestTube, Mail, Server, Shield, User, Lock } from 'lucide-react';

interface EmailSettingsData {
  id: number;
  smtpHost: string;
  smtpPort: number;
  encryption: string;
  authentication: boolean;
  smtpUsername: string;
  smtpPassword?: string;
  contactFormRecipient: string;

}

const EmailSettings: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<EmailSettingsData>({
    id: 1,
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    encryption: 'TLS',
    authentication: true,
    smtpUsername: 'wifi@kuzuflex.com',
    contactFormRecipient: 'bilgiislem@kuzuflex.com'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/email-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      }
    } catch (error) {
      console.error('Email ayarları alınamadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage({ type: null, text: '' });
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Email ayarları başarıyla kaydedildi!' });
        fetchEmailSettings(); // Güncel veriyi al
      } else {
        setMessage({ type: 'error', text: data.message || 'Kaydetme hatası' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setMessage({ type: null, text: '' });
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/email-settings/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Test email başarıyla gönderildi! Mail kutunuzu kontrol edin.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Test email gönderilemedi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (field: keyof EmailSettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Email Ayarları</h1>
          </div>
          <p className="text-blue-100 mt-1">SMTP sunucu konfigürasyonu ve email ayarları</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* SMTP Ayarları */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Server className="w-5 h-5 mr-2 text-blue-600" />
              SMTP Sunucu Ayarları
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMTP Host */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.office365.com"
                />
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <select
                  value={settings.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={25}>25</option>
                  <option value={465}>465</option>
                  <option value={587}>587</option>
                  <option value={993}>993</option>
                </select>
              </div>

              {/* Encryption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifreleme
                </label>
                <div className="space-y-2">
                  {['Yok', 'SSL', 'TLS'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="encryption"
                        value={option}
                        checked={settings.encryption === option}
                        onChange={(e) => handleInputChange('encryption', e.target.value)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Çoğu sunucu için TLS, önerilen seçenektir. SMTP sağlayıcınız hem SSL hem de TLS seçenekleri sunuyorsa öneririz.
                </p>
              </div>

              {/* Authentication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kimlik Doğrulama
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.authentication}
                    onChange={(e) => handleInputChange('authentication', e.target.checked)}
                    className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">AÇIK</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kimlik Bilgileri */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Kimlik Bilgileri
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMTP Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Kullanıcı Adı
                </label>
                <input
                  type="email"
                  value={settings.smtpUsername}
                  onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="wifi@kuzuflex.com"
                />
              </div>

              {/* SMTP Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Şifresi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.smtpPassword || ''}
                    onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <Lock className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Parola veritabanında şifrelenmiştir, ancak iyileştirilmiş güvenlik için parolayı ayarlamak üzere sitenizin .env dosyasını kullanmanızı öneririz.
                </p>
              </div>
            </div>
          </div>

          {/* Email Ayarları */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Email Ayarları
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Form Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim Formu Alıcısı
                </label>
                <input
                  type="email"
                  value={settings.contactFormRecipient}
                  onChange={(e) => handleInputChange('contactFormRecipient', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="bilgiislem@kuzuflex.com"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          {message.type && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isTesting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <TestTube className="w-5 h-5 mr-2" />
              )}
              {isTesting ? 'Test Ediliyor...' : 'Test Email Gönder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
