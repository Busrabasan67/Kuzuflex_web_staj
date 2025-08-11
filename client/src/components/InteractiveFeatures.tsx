// client/src/components/InteractiveFeatures.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMessageCircle, FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const InteractiveFeatures: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Contact & Newsletter */}
          <div className="space-y-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-3xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  {t('home.interactive.contactTitle', 'İletişim')}
                </span>
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FiPhone className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">{t('home.interactive.phone', 'Telefon')}</p>
                    <p className="text-white font-semibold">+90 850 800 22</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FiMail className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">{t('home.interactive.email', 'E-posta')}</p>
                    <p className="text-white font-semibold">info@kuzuflex.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FiMapPin className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">{t('home.interactive.address', 'Adres')}</p>
                    <p className="text-white font-semibold">İstanbul, Türkiye</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-2xl font-bold mb-4">
                {t('home.interactive.newsletterTitle', 'Güncel Kalın')}
              </h4>
              <p className="text-blue-200 mb-6">
                {t('home.interactive.newsletterDescription', 'En son ürünler ve çözümler hakkında bilgi alın')}
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('home.interactive.emailPlaceholder', 'E-posta adresiniz')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors duration-300"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-300"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
                
                {isSubscribed && (
                  <div className="bg-green-500/20 border border-green-400/40 text-green-300 px-4 py-2 rounded-lg text-sm">
                    {t('home.interactive.subscribedMessage', 'Başarıyla abone oldunuz!')}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Side - Live Chat & Quick Contact */}
          <div className="space-y-8">
            {/* Live Chat Widget */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <FiMessageCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">
                    {t('home.interactive.liveChatTitle', 'Canlı Destek')}
                  </h4>
                  <p className="text-blue-200 text-sm">
                    {t('home.interactive.liveChatStatus', 'Şu anda aktif')}
                  </p>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25">
                {t('home.interactive.startChatButton', 'Sohbet Başlat')}
              </button>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-6">
                {t('home.interactive.quickContactTitle', 'Hızlı İletişim')}
              </h4>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('home.interactive.namePlaceholder', 'Adınız')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors duration-300"
                />
                <input
                  type="email"
                  placeholder={t('home.interactive.emailPlaceholder', 'E-posta')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors duration-300"
                />
                <textarea
                  placeholder={t('home.interactive.messagePlaceholder', 'Mesajınız')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors duration-300 resize-none"
                ></textarea>
                
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                  {t('home.interactive.sendMessageButton', 'Mesaj Gönder')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="text-center mt-16 pt-16 border-t border-white/20">
          <h4 className="text-2xl font-bold text-white mb-8">
            {t('home.interactive.socialTitle', 'Bizi Takip Edin')}
          </h4>
          
          <div className="flex justify-center space-x-6">
            {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map((platform) => (
              <button
                key={platform}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <span className="text-white font-semibold text-sm">{platform.charAt(0)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatures;
