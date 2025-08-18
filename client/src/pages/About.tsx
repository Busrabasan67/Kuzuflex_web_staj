import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface PageData {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
  heroImageUrl?: string;
}

interface ExtraContent {
  id: number;
  type: string;
  title: string;
  content: string;
  order: number;
  language: string;
}

const fixImageUrls = (htmlContent: string): string => {
  if (!htmlContent) return '';
  let fixed = htmlContent
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  fixed = fixed.replace(/src="\/uploads\//g, 'src="http://localhost:5000/uploads/');
  return fixed;
};

const About = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<PageData | null>(null);
  const [extraContents, setExtraContents] = useState<ExtraContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ana sayfa verilerini ve ekstra içerikleri paralel olarak çek
        const [pageRes, extraRes] = await Promise.all([
          fetch(`http://localhost:5000/api/about-page?lang=${i18n.language}`),
          fetch(`http://localhost:5000/api/about-page-extra-content/language/${i18n.language}`)
        ]);
        
        if (!pageRes.ok) throw new Error('About verisi yüklenemedi');
        if (!extraRes.ok) throw new Error('Ekstra içerikler yüklenemedi');
        
        const [pageData, extraData] = await Promise.all([
          pageRes.json(),
          extraRes.json()
        ]);
        
        console.log('About.tsx - API\'den gelen pageData:', pageData);
        console.log('About.tsx - API\'den gelen extraData:', extraData);
        
        // Dil bazında filtreleme yap
        const currentLang = i18n.language;
        
        // Mevcut dildeki çeviriyi bul
        const currentTranslation = pageData.translations?.find((t: any) => t.language === currentLang);
        
        const filteredPageData = {
          ...pageData,
          // Hero section için gerekli alanları set et
          title: currentTranslation?.title || '',
          translations: pageData.translations?.filter((t: any) => t.language === currentLang) || [],
          extraContents: pageData.extraContents?.filter((c: any) => c.language === currentLang) || []
        };
        
        console.log('About.tsx - Mevcut dil:', currentLang);
        console.log('About.tsx - Bulunan çeviri:', currentTranslation);
        console.log('About.tsx - Filtrelenmiş pageData:', filteredPageData);
        console.log('About.tsx - Title:', filteredPageData.title);
        
        setData(filteredPageData);
        setExtraContents(extraData);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('error.generalError'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n.language, t]);

  const renderExtraContent = (content: ExtraContent) => {
    try {
      if (content.type === 'text') {
        const decodeEntities = (s: string) =>
          s
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'");

        let raw = (content.content || '').trim();
        let textContent: string = raw;

        try {
          textContent = JSON.parse(raw);
        } catch {
          textContent = raw;
        }

        if (typeof textContent !== 'string') {
          textContent = String(textContent ?? '');
        }

        if (textContent.startsWith('"') && textContent.endsWith('"')) {
          textContent = textContent.slice(1, -1);
        }

        textContent = decodeEntities(textContent);
        
        // Başlık varsa kaldır, sadece içeriği göster
        if (content.title && content.title.trim()) {
          // Başlık bilgisi var ama gösterilmiyor
          console.log('Text content başlığı:', content.title);
        }
        
        // Font size ve diğer stil bilgilerini koru
        return `<div class="extra-content-text">${textContent}</div>`;
      }

      if (content.type === 'mixed') {
        if (content.content.trim().startsWith('{') && content.content.trim().endsWith('}')) {
          try {
            const parsedContent = JSON.parse(content.content);
            
            if (parsedContent.html && parsedContent.json) {
              const jsonContent = parsedContent.json;
              
              if (jsonContent.title && jsonContent.layout && jsonContent.elements) {
                // Başlığı kaldır, sadece içeriği göster
                const htmlWithoutTitle = parsedContent.html.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '');
                return htmlWithoutTitle || parsedContent.html;
              }
            }
            
            if (parsedContent.title && parsedContent.layout && parsedContent.elements) {
              // Başlığı kaldır, sadece içeriği göster
              const htmlWithoutTitle = parsedContent.html.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '');
              return htmlWithoutTitle || parsedContent.html;
            }
          } catch (parseError) {
            console.error('Mixed content JSON parsing error:', parseError);
          }
        }
        
        const processedHTML = fixImageUrls(content.content);
        return processedHTML;
      }

      if (content.content.trim().startsWith('{') && content.content.trim().endsWith('}')) {
        try {
          const parsedContent = JSON.parse(content.content);
          
          switch (content.type) {
            case 'table':
              if (parsedContent.headers && parsedContent.rows) {
                let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">';
                
                tableHtml += '<thead><tr>';
                parsedContent.headers.forEach((header: string, columnIndex: number) => {
                  const style = parsedContent.styles && parsedContent.styles[columnIndex];
                  const headerStyle = style ? 
                    `background-color: ${style.headerBackgroundColor}; color: ${style.headerTextColor};` : 
                    'background-color: #f3f4f6; color: #000000;';
                  
                  tableHtml += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold" style="${headerStyle}">${header}</th>`;
                });
                tableHtml += '</tr></thead>';
                
                tableHtml += '<tbody>';
                parsedContent.rows.forEach((row: string[]) => {
                  tableHtml += '<tr>';
                  row.forEach((cell: string, columnIndex: number) => {
                    const style = parsedContent.styles && parsedContent.styles[columnIndex];
                    const cellStyle = style ? 
                      `background-color: ${style.backgroundColor}; color: ${style.textColor};` : 
                      'background-color: #ffffff; color: #000000;';
                    
                    tableHtml += `<td class="border border-gray-300 px-4 py-2" style="${cellStyle}">${cell}</td>`;
                  });
                  tableHtml += '</tr>';
                });
                tableHtml += '</tbody></table></div>';
                
                return tableHtml || '';
              }
              break;
              
            case 'list':
              if (parsedContent.items) {
                const tag = parsedContent.type === 'ordered' ? 'ol' : 'ul';
                const className = parsedContent.type === 'ordered' 
                  ? 'list-decimal list-inside space-y-1 my-4' 
                  : 'list-disc list-inside space-y-1 my-4';
                
                let listHtml = `<${tag} class="${className}">`;
                parsedContent.items.forEach((item: string) => {
                  listHtml += `<li class="text-gray-700">${item}</li>`;
                });
                listHtml += `</${tag}>`;
                
                return listHtml;
              }
              break;
              
            case 'image':
              if (parsedContent) {
                const imageUrl = parsedContent.startsWith('/uploads/') ? `http://localhost:5000${parsedContent}` : parsedContent;
                return `<div class="my-4"><img src="${imageUrl}" alt="Content Image" class="max-w-full h-auto rounded-lg shadow-md" /></div>`;
              }
              break;
              
            default:
              return `<div class="text-gray-700">${content.content}</div>`;
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
        }
      }
      
      return fixImageUrls(content.content);
    } catch (error) {
      console.error('Content parsing error:', error);
      return `<div class="text-gray-700">${content.content}</div>`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">{t('loading.solutionInfo')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error.title')}</h1>
          <p className="text-gray-600">{error || t('error.generalError')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Sadece heroImageUrl varsa göster */}
      {data.heroImageUrl && (
        <div className="relative h-72 md:h-96 bg-blue-600">
          <img
            src={data.heroImageUrl.startsWith('http') ? data.heroImageUrl : `http://localhost:5000${data.heroImageUrl}`}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative h-full flex items-center justify-center text-center text-white px-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{data.title || t('pages.contact.title')}</h1>
            </div>
          </div>
        </div>
      )}



              {/* Extra Contents Section - Yatay Kartlar */}
        {extraContents && extraContents.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="space-y-10">
              {extraContents
                .sort((a, b) => a.order - b.order)
                .map((content) => (
                  <div
                    key={content.id}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* İçerik alanı - Tam genişlik */}
                    <div className="p-10 md:p-16">
                      <div className="prose prose-xl max-w-none">
                        <div 
                          className="text-gray-700 rich-text-content"
                          dangerouslySetInnerHTML={{ __html: renderExtraContent(content) }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}




    </div>
  );
};

export default About;
