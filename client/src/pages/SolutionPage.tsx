import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { generateMixedContentHTML } from "../utils/htmlGenerators";

interface Solution {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  hasExtraContent: boolean;
  extraContents: ExtraContent[];
}

interface ExtraContent {
  id: number;
  type: string;
  title: string;
  content: string;
  order: number;
  language: string;
}

const SolutionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resim URL'lerini düzelt
  const fixImageUrls = (htmlContent: string): string => {
    // /uploads/ ile başlayan URL'leri tam URL'ye çevir
    let fixedContent = htmlContent.replace(
      /src="\/uploads\//g, 
      'src="http://localhost:5000/uploads/'
    );
    
    // Konum ve boyut bilgilerini CSS ile uygula
    fixedContent = fixedContent.replace(
      /style="([^"]*width:\s*([^;]+);[^"]*)"/g,
      (match, style, width) => {
        // Width değerini CSS class olarak uygula
        return `style="${style}" class="w-full"`;
      }
    );
    
    return fixedContent;
  };

  // Ekstra içeriği render et
  const renderExtraContent = (content: ExtraContent) => {
    try {
      // Eğer content zaten HTML ise (mixed type için)
      if (content.type === 'mixed') {
        console.log('🔍 Mixed content detected:', content.content.substring(0, 200));
        
        // Mixed content için önce JSON olup olmadığını kontrol et
        if (content.content.trim().startsWith('{') && content.content.trim().endsWith('}')) {
          console.log('✅ Content looks like JSON, attempting to parse...');
          
          // JSON formatında ise parse et
          try {
            const parsedContent = JSON.parse(content.content);
            console.log('✅ First level parsed:', parsedContent);
            
            // Eğer html ve json alanları varsa, json alanını kullan
            if (parsedContent.html && parsedContent.json) {
              console.log('✅ Found html and json fields, json field is already an object');
              
              // parsedContent.json zaten bir object, tekrar parse etmeye gerek yok
              const jsonContent = parsedContent.json;
              console.log('✅ Using json field directly:', jsonContent);
              
              if (jsonContent.title && jsonContent.layout && jsonContent.elements) {
                console.log('✅ All required fields found, generating HTML...');
                const result = generateMixedContentHTML(jsonContent.title, jsonContent.layout, jsonContent.elements);
                console.log('✅ Generated HTML:', result.substring(0, 200));
                return result;
              } else {
                console.log('❌ Missing required fields in jsonContent:', {
                  hasTitle: !!jsonContent.title,
                  hasLayout: !!jsonContent.layout,
                  hasElements: !!jsonContent.elements
                });
              }
            } else {
              console.log('❌ No html/json fields found in parsedContent');
            }
            
            // Eğer doğrudan title, layout, elements varsa
            if (parsedContent.title && parsedContent.layout && parsedContent.elements) {
              console.log('✅ Direct fields found, generating HTML...');
              const result = generateMixedContentHTML(parsedContent.title, parsedContent.layout, parsedContent.elements);
              console.log('✅ Generated HTML:', result.substring(0, 200));
              return result;
            } else {
              console.log('❌ No direct fields found in parsedContent');
            }
          } catch (parseError) {
            console.error('❌ Mixed content JSON parsing error:', parseError);
          }
        } else {
          console.log('❌ Content does not look like JSON');
        }
        
        console.log('🔄 Falling back to HTML processing');
        // JSON değilse veya parse edilemezse, HTML olarak işle
        return fixImageUrls(content.content);
      }

      // JSON string'i parse et (sadece JSON formatında ise)
      if (content.content.trim().startsWith('{') && content.content.trim().endsWith('}')) {
        try {
          const parsedContent = JSON.parse(content.content);
          
          switch (content.type) {
            case 'text':
              return `<div class="text-gray-700 leading-relaxed">${parsedContent}</div>`;
              
            case 'table':
              if (parsedContent.headers && parsedContent.rows) {
                let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">';
                
                // Header
                tableHtml += '<thead><tr>';
                parsedContent.headers.forEach((header: string, columnIndex: number) => {
                  const style = parsedContent.styles && parsedContent.styles[columnIndex];
                  const headerStyle = style ? 
                    `background-color: ${style.headerBackgroundColor}; color: ${style.headerTextColor};` : 
                    'background-color: #f3f4f6; color: #000000;';
                  
                  tableHtml += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold" style="${headerStyle}">${header}</th>`;
                });
                tableHtml += '</tr></thead>';
                
                // Body
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
      
      // JSON değilse veya parse edilemezse, content'i HTML olarak döndür
      return fixImageUrls(content.content);
      
      // Eğer hiçbir case eşleşmezse
      return `<div class="text-gray-700">${content.content}</div>`;
    } catch (error) {
      console.error('Content parsing error:', error);
      return `<div class="text-gray-700">${content.content}</div>`;
    }
  };

  useEffect(() => {
    const fetchSolution = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/solutions/${slug}?lang=${i18n.language}`);
        
        if (!response.ok) {
          throw new Error(t('error.solutionNotFound'));
        }

        const data: Solution = await response.json();
        setSolution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [slug, i18n.language, t]);

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

  if (error || !solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error.title')}</h1>
          <p className="text-gray-600">{error || t('error.solutionNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{solution.title}</h1>
            <p className="text-xl md:text-2xl opacity-90">{solution.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-6">
            <img
              src={`http://localhost:5000${solution.imageUrl}`}
              alt={solution.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{solution.title}</h2>
              <p className="text-xl text-gray-600 mb-6">{solution.subtitle}</p>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {solution.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Contents */}
        {solution.hasExtraContent && solution.extraContents && solution.extraContents.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Ek İçerikler ({solution.extraContents.length} adet)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solution.extraContents.map((content) => (
                <div
                  key={content.id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {content.title}
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: renderExtraContent(content) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Bu çözüm hakkında daha fazla bilgi almak ister misiniz?
            </h3>
            <p className="text-gray-600 mb-6">
              Uzman ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                İletişime Geçin
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Teklif Alın
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionPage;