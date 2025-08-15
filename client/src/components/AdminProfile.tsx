import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiEdit3, FiSave, FiX, FiCheck, FiAlertCircle, FiEye, FiLock, FiShield, FiActivity } from 'react-icons/fi';
import ChangePasswordForm from './ChangePasswordForm';

interface AdminData {
  id: number;
  username: string;
  email: string;
}

interface AdminProfileProps {
  onProfileUpdate?: (updatedData: AdminData) => void;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ onProfileUpdate }) => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [activeTab, setActiveTab] = useState('general');
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAdminData(data.admin);
        setFormData({
          username: data.admin.username,
          email: data.admin.email
        });
      } else {
        setMessage(data.message || 'Profil bilgileri alınamadı');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: '',
      email: ''
    };

    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.email;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setMessage('');
    
    // Message'ı temizlemek için timer
    const clearMessageTimer = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000); // 5 saniye sonra message'ı temizle

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        const updatedData = data.admin;
        setAdminData(updatedData);
        
        // Parent component'e güncellenmiş bilgileri gönder
        if (onProfileUpdate) {
          onProfileUpdate(updatedData);
        }
        
        // Form verilerini de güncelle
        setFormData({
          username: updatedData.username,
          email: updatedData.email
        });
        
        setMessage('✅ Profil bilgileri başarıyla güncellendi! Değişiklikler hemen yansıdı.');
        setMessageType('success');
        setIsEditing(false);
        setErrors({ username: '', email: '' });
        
        // Message'ı 5 saniye sonra temizle
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      } else {
        setMessage(data.message || 'Profil güncellenemedi');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu');
      setMessageType('error');
    } finally {
      setIsSaving(false);
      clearTimeout(clearMessageTimer); // Timer'ı temizle
    }
  };

  const handleCancel = () => {
    if (adminData) {
      setFormData({
        username: adminData.username,
        email: adminData.email
      });
    }
    setIsEditing(false);
    setErrors({ username: '', email: '' });
    setMessage('');
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profil Bilgileri Bulunamadı</h3>
          <p className="text-gray-600 mb-4">Kullanıcı bilgileri yüklenemedi.</p>
          <button
            onClick={fetchAdminProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'Genel Bilgiler', icon: FiUser },
    { id: 'security', name: 'Güvenlik', icon: FiShield },
    { id: 'activity', name: 'Aktivite', icon: FiActivity }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'security':
        return renderSecurityTab();
      case 'activity':
        return renderActivityTab();
      default:
        return renderGeneralTab();
    }
  };

  const renderGeneralTab = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
            <FiUser className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h3>
            <p className="text-gray-500">Hesap bilgilerinizi güncelleyin</p>
          </div>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEdit3 className="text-sm" />
            <span>Düzenle</span>
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {messageType === 'success' ? (
            <FiCheck className="text-green-600 flex-shrink-0" />
          ) : (
            <FiAlertCircle className="text-red-600 flex-shrink-0" />
          )}
          <span className={`${
            messageType === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message}
          </span>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Kullanıcı Adı
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={!isEditing}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg transition-all ${
                isEditing 
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              } ${errors.username ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Kullanıcı adınızı girin"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Adresi
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg transition-all ${
                isEditing 
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              } ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Email adresinizi girin"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <FiSave className="text-lg" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="text-lg" />
              <span>İptal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-lg">
            <FiLock className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Şifre Güncelle</h3>
            <p className="text-gray-500">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
          </div>
        </div>
        
        <ChangePasswordForm />
      </div>

      {/* Güvenlik Bilgileri */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
            <FiShield className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Güvenlik Durumu</h3>
            <p className="text-gray-500">Hesap güvenliğinizin genel durumu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiCheck className="text-green-600 text-xl" />
              <div>
                <h4 className="font-semibold text-green-800">Güçlü Şifre</h4>
                <p className="text-sm text-green-600">Şifreniz güvenlik standartlarını karşılıyor</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiEye className="text-blue-600 text-xl" />
              <div>
                <h4 className="font-semibold text-blue-800">Hesap Aktif</h4>
                <p className="text-sm text-blue-600">Hesabınız aktif ve güvenli durumda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-lg">
          <FiActivity className="text-white text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Hesap Aktivitesi</h3>
          <p className="text-gray-500">Son aktivitelerinizi görüntüleyin</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Son giriş</span>
          </div>
          <span className="text-gray-500 text-sm">Bugün, 14:30</span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Profil güncelleme</span>
          </div>
          <span className="text-gray-500 text-sm">2 gün önce</span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Şifre değişikliği</span>
          </div>
          <span className="text-gray-500 text-sm">1 hafta önce</span>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Daha detaylı aktivite geçmişi yakında eklenecektir.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profil Ayarları</h2>
        <p className="text-gray-600 text-lg">Hesap bilgilerinizi yönetin ve güncelleyin</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sol Panel - Profil Özeti */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                {adminData.username}
              </h3>
              <p className="text-blue-700 text-sm mb-4 break-all">
                {adminData.email}
              </p>
              <div className="bg-blue-100 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2">
                  <FiEye className="text-blue-600 text-sm" />
                  <span className="text-blue-800 text-xs font-medium">Admin Yetkisi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <FiCheck className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Durum</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Hesap:</span>
                <span className="text-green-600 font-medium">Aktif</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Yetki:</span>
                <span className="text-blue-600 font-medium">Yönetici</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Son Giriş:</span>
                <span className="font-medium">Bugün</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ana Panel - Tab Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

