import React, { createContext, useState, useEffect } from "react"; // createContext , Uygulama geneline veri aktarımını sağlayacak context'i oluşturur.
//useState: Dark mode açık mı kapalı mı onu tutar.
//useEffect: Dark mode değiştiğinde localStorage'a kaydeder.


//Context Tipi Tanımı (Context'in içeriğini tanımlar)
//Bu bir TypeScript arayüzü (interface). Context içinde hangi veri ve fonksiyonlar olacağını tanımlar:
//darkMode: şu anda karanlık mod açık mı (true/false)
//setDarkMode: darkMode değerini değiştiren fonksiyon
// Bu sayede context kullanılırken tip güvenliği olur. TypeScript sayesinde hataları daha derlemede fark edersin.
interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

//Context Nesnesi Oluşturuluyor
//ThemeContext adlı bir context oluşturur.
//Başlangıç değeri: darkMode: false ve boş bir setDarkMode fonksiyonu.
//Gerçekte kullanılacak değer, Provider tarafından geçilecek (aşağıda).

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
});

//ThemeProvider: Context'i kullanabilmek için bir Provider oluşturur.
//Bu bileşen tüm uygulamayı sarmalayacak.
//children: içine sarılan JSX bileşenler (örneğin <App />).
//children: Context'i kullanacak olan bileşenleri içerir.
//darkMode: localStorage'dan okunan değer.
//setDarkMode: darkMode değerini değiştiren fonksiyon.
//useEffect: darkMode değiştiğinde localStorage'a kaydeder.

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //State Başlangıcı ve localStorage Okuma
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode"); ///Sayfa açıldığında ilk değer localStorage'dan okunur.
    return stored ? JSON.parse(stored) : false; //Kayıt yoksa false yani light mode olur.
  });

  useEffect(() => { //Dark Mode Class ve localStorage Güncellemesi
    localStorage.setItem("darkMode", JSON.stringify(darkMode)); //darkMode değiştiğinde localStorage'a kaydeder.
    if (darkMode) {
      document.documentElement.classList.add("dark"); //dark mode açıldığında dark class eklenir.
    } else {
      document.documentElement.classList.remove("dark");  //light mode açıldığında dark class silinir.
    }
  }, [darkMode]); 
   //Bu useEffect şunu yapar: darkMode her değiştiğinde:
  //localStorage'a güncel değer yazılır.
  //<html> elementine dark class'ı eklenir veya kaldırılır
  //📌 Tailwind'de darkMode: 'class' olduğu için bu class sayfada karanlık modun çalışmasını sağlar.
  
  
//Context Sağlayıcı Return
//ThemeContext.Provider ile context tüm çocuk bileşenlere sunulur
//value içinde darkMode değeri ve setDarkMode fonksiyonu paylaşılır
//Artık uygulamanın her yerinde useContext(ThemeContext) ile bu değerlere ulaşabilirsin.

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 