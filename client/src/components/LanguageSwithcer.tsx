import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown } from "react-icons/fi";

// Daha doğru bayrak SVG'leri
const Flags = {
  en: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="g">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#g)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  tr: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="24" height="16">
      <rect width="300" height="200" fill="#E30A17" />
      <circle cx="120" cy="100" r="40" fill="#fff" />
      <circle cx="135" cy="100" r="32" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="170,100 159.5,106.5 162.5,94 152,86 164.5,86 170,74 175.5,86 188,86 177.5,94 180.5,106.5"
      />
    </svg>
  ),
  de: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12">
      <rect y="0" width="60" height="10" fill="#000"/>
      <rect y="10" width="60" height="10" fill="#D00"/>
      <rect y="20" width="60" height="10" fill="#FFCE00"/>
    </svg>
  ),
  fr: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12">
      <rect x="0" width="20" height="30" fill="#002395"/>
      <rect x="20" width="20" height="30" fill="#fff"/>
      <rect x="40" width="20" height="30" fill="#ED2939"/>
    </svg>
  )
};

const languageOptions = [
  { code: "en", name: "English", label: "EN English" },
  { code: "tr", name: "Türkçe", label: "TR Türkçe" },
  { code: "de", name: "Deutsch", label: "DE Deutsch" },
  { code: "fr", name: "Français", label: "FR Français" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation(); // 🟢 i18n.language ile mevcut dil bilgisi alınır
  const [isOpen, setIsOpen] = useState(false); // 🟢 Dil seçimi açık/kapalı durumunu kontrol eder

  const currentLanguage = languageOptions.find(lang => lang.code === i18n.language) || languageOptions[0];// 🟢 Mevcut dil bilgisini alır

  const changeLanguage = (lng: string) => { // 🟢 Dil değiştirme fonksiyonu.
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const FlagComponent = Flags[currentLanguage.code as keyof typeof Flags] || Flags.en;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
        aria-label="Change language"
      >
        <div className="w-6 flex justify-center">
          <FlagComponent />
        </div>
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage.label}
        </span>
        <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden">
          {languageOptions.map((language) => {
            const Flag = Flags[language.code as keyof typeof Flags];
            return (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors ${
                  i18n.language === language.code
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="w-6 flex justify-center">
                  <Flag />
                </div>
                <div className="flex-1">{language.label}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;