// client/src/components/ContactSection.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiMessageCircle } from 'react-icons/fi';

const ContactSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get language name
      const getLanguageName = (lang: string) => {
        switch(lang) {
          case 'tr': return 'Türkçe';
          case 'en': return 'English';
          case 'de': return 'Deutsch';
          case 'fr': return 'Français';
          default: return 'Türkçe';
        }
      };

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language: i18n.language,
          languageName: getLanguageName(i18n.language)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
        
        // Success mesajını 5 saniye sonra otomatik olarak kaldır
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
        }, 5000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message
        });
        
        // Error mesajını 8 saniye sonra otomatik olarak kaldır
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
        }, 8000);
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: t('pages.contact.connectionError', 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
      });
      
      // Connection error mesajını 8 saniye sonra otomatik olarak kaldır
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.03'%3E%3Cpath d='M50 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm0-50c0-27.614-22.386-50-50-50s-50 22.386-50 50 22.386 50 50 50 50-22.386 50-50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Contact Information */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('pages.home.contact.title', 'İletişim')}
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                {t('pages.home.contact.subtitle', 'Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.')}
              </p>
            </div>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FiPhone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {t('pages.home.contact.phone', 'Telefon')}
                  </p>
                  <p className="text-blue-100">
                    {t('pages.home.contact.phoneNumber', '+90 850 800 22 22')}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {t('pages.home.contact.email', 'E-posta')}
                  </p>
                  <p className="text-blue-100">
                    {t('pages.home.contact.emailAddress', 'info@kuzuflex.com')}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FiMapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {t('pages.home.contact.address', 'Adres')}
                  </p>
                  <p className="text-blue-100">
                    {t('pages.home.contact.addressText', 'İstanbul, Türkiye')}
                  </p>
                </div>
              </div>
            </div>

              {/* Social Media Links */}
             <div className="text-center lg:text-left">
               <h3 className="text-xl font-semibold text-white mb-4">
                 {t('pages.home.contact.socialTitle', 'Bizi Takip Edin')}
               </h3>
               <div className="flex space-x-4 justify-center lg:justify-start">
                 <a 
                   href="https://www.linkedin.com/company/kuzuflex-metal-sanayi-ve-tic.-a.s." 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
                   title="LinkedIn"
                 >
                   <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                   </svg>
                 </a>
                 <a 
                   href="https://www.instagram.com/kuzuflexmetal/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
                   title="Instagram"
                 >
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                 </a>
                 <a 
                   href="https://www.youtube.com/@kuzuflexmetal3924" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300 group"
                   title="YouTube"
                 >
                   <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                   </svg>
                 </a>
               </div>
             </div>
          </div>

          {/* Right Side - Quick Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                {t('pages.home.contact.quickContactTitle', 'Hızlı İletişim')}
              </h3>
              <p className="text-blue-100">
                {t('pages.home.contact.quickContactSubtitle', 'Mesajınızı gönderin, en kısa sürede size dönüş yapalım.')}
              </p>
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`mb-6 p-4 rounded-xl border-l-4 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-400' 
                  : 'bg-red-50 text-red-800 border-red-400'
              }`}>
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full mr-3 ${
                    submitStatus.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <p className="font-medium">{submitStatus.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder={t('pages.home.contact.namePlaceholder', 'Adınız')}
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder={t('pages.home.contact.emailPlaceholder', 'E-posta adresiniz')}
                />
              </div>

              {/* Phone Input */}
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder={t('pages.home.contact.phonePlaceholder', 'Telefon numaranız')}
                />
              </div>

              {/* Message Input */}
              <div className="relative">
                <FiMessageCircle className="absolute left-3 top-3 text-blue-300 w-5 h-5" />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder={t('pages.home.contact.messagePlaceholder', 'Mesajınız')}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-white to-blue-100 hover:from-blue-100 hover:to-white text-blue-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 mr-2"></div>
                    {t('pages.contact.sending', 'Gönderiliyor...')}
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5 mr-2" />
                    {t('pages.home.contact.sendMessageButton', 'Mesaj Gönder')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
