import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Send, Building2, Globe } from 'lucide-react';

const Contact = () => {
  const { t, i18n } = useTranslation();
  
  // Debug: i18n durumunu kontrol et
  console.log('i18n object:', i18n);
  console.log('i18n.language:', i18n.language);
  console.log('i18n.languages:', i18n.languages);
  console.log('i18n.isInitialized:', i18n.isInitialized);
  console.log('Translation test:', t('common.languageName'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Dil adını manuel olarak belirle
      const getLanguageName = (lang: string) => {
        switch(lang) {
          case 'tr': return 'Türkçe';
          case 'en': return 'English';
          case 'de': return 'Deutsch';
          case 'fr': return 'Français';
          default: return 'Türkçe';
        }
      };

      const formDataWithLanguage = {
        ...formData,
        language: i18n.language, // Mevcut dili ekle
        languageName: getLanguageName(i18n.language) // Dil adını manuel olarak ekle
      };
      
      console.log('Gönderilen Form Verisi:', formDataWithLanguage);
      console.log('Mevcut Dil:', i18n.language);
      console.log('Dil Adı:', getLanguageName(i18n.language));
      
      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithLanguage),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: t('pages.contact.connectionError')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailClick = (email: string, subject: string = '') => {
    const mailtoLink = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
    window.open(mailtoLink);
  };

  const handleDirectionsClick = (address: string) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('pages.contact.title')}</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Contact Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* KUZUFLEX TURKEY */}
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">KUZUFLEX TURKEY</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium">KUZU FLEX METAL SAN. Ve TIC. A.Ş</p>
                    <p className="text-gray-600 text-sm">Ata Mh. Serbest Bölge Gelincik Cd. No:1</p>
                    <p className="text-gray-600 text-sm">TR 16600 Gemlik / BURSA</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">+90 850 800 2222</p>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <button
                    onClick={() => handleEmailClick('basanbusra1767@gmail.com')}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline decoration-blue-300 hover:decoration-blue-600"
                  >
                    basanbusra1767@gmail.com
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => handleDirectionsClick('KUZU FLEX METAL SAN. Ve TIC. A.Ş, Ata Mh. Serbest Bölge Gelincik Cd. No:1, Gemlik, Bursa')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                <MapPin className="w-5 h-5 mr-2" />
                DIRECTIONS
              </button>
            </div>

            {/* KUZUFLEX GERMANY */}
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">KUZUFLEX GERMANY</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium">KUZU FLEX DEUTSCHLAND GmbH</p>
                    <p className="text-gray-600 text-sm">Max-Planck-Strasse 2</p>
                    <p className="text-gray-600 text-sm">D - 21502 Geesthacht</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">+49 (0) 4152 889 256</p>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">+49 (0) 152 288 30 946</p>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <button
                    onClick={() => handleEmailClick('deutschland@kuzuflex.com')}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline decoration-blue-300 hover:decoration-blue-600"
                  >
                    deutschland@kuzuflex.com
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => handleDirectionsClick('KUZU FLEX DEUTSCHLAND GmbH, Max-Planck-Strasse 2, Geesthacht, Germany')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                <MapPin className="w-5 h-5 mr-2" />
                DIRECTIONS
              </button>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{t('pages.contact.formTitle')}</h3>
              </div>
              
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
                <div className="group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 group-hover:bg-white"
                    placeholder={t('pages.contact.namePlaceholder')}
                  />
                </div>

                <div className="group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 group-hover:bg-white"
                    placeholder={t('pages.contact.emailPlaceholder')}
                  />
                </div>

                <div className="group">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 group-hover:bg-white"
                    placeholder={t('pages.contact.phonePlaceholder')}
                  />
                </div>

                <div className="group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 group-hover:bg-white resize-none"
                    placeholder={t('pages.contact.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('pages.contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('pages.contact.sendButton')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Google Maps Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('pages.contact.locationsTitle')}
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('pages.contact.locationsSubtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Turkey Location */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">TURKEY LOCATION</h3>
                  </div>
                </div>
                <div className="h-96 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d97223.14666542292!2d29.113093!3d40.403903!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ca5b99ff1b86c7%3A0xbc9757ae16e82dc2!2sKuzuflex!5e0!3m2!1sen!2sus!4v1755072453498!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="KUZUFLEX Turkey Location"
                  ></iframe>

                </div>
              </div>

              {/* Germany Location */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">GERMANY LOCATION</h3>
                  </div>
                </div>
                <div className="h-96 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9513.541661738538!2d10.422818!3d53.407933!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b1e5abe7fbb269%3A0x6c17ee569e4d7c9e!2sKuzuflex%20Deutschland%20GmbH!5e0!3m2!1sen!2sus!4v1755072274852!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="KUZUFLEX Germany Location"
                  ></iframe>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
