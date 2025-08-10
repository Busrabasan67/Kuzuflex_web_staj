// HTML Generation utilities for content management

export interface ColumnStyle {
  backgroundColor: string;
  textColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  styles?: ColumnStyle[];
}

export interface ListData {
  items: string[];
  type: 'ordered' | 'unordered';
}

export interface ContentElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'list';
  content: any;
  position?: 'left' | 'right' | 'full';
  width?: '25%' | '50%' | '75%' | '100%';
}

// Tablo verilerini HTML'e çevir
export const generateTableHTML = (tableData: TableData): string => {
  if (!tableData || !tableData.headers || !tableData.rows) {
    return '<p>Tablo verisi bulunamadı</p>';
  }

  let html = '<div class="table-container overflow-x-auto my-4">';
  html += '<table class="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">';
  
  // Header
  html += '<thead><tr>';
  tableData.headers.forEach((header, columnIndex) => {
    const style = tableData.styles && tableData.styles[columnIndex];
    const headerStyle = style ? 
      `background-color: ${style.headerBackgroundColor}; color: ${style.headerTextColor};` : 
      'background-color: #f3f4f6; color: #000000;';
    
    html += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold" style="${headerStyle}">${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Body
  html += '<tbody>';
  tableData.rows.forEach(row => {
    html += '<tr>';
    row.forEach((cell, columnIndex) => {
      const style = tableData.styles && tableData.styles[columnIndex];
      const cellStyle = style ? 
        `background-color: ${style.backgroundColor}; color: ${style.textColor};` : 
        'background-color: #ffffff; color: #000000;';
      
      html += `<td class="border border-gray-300 px-4 py-2" style="${cellStyle}">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  
  html += '</table></div>';
  return html;
};

// Liste verilerini HTML'e çevir
export const generateListHTML = (listData: ListData): string => {
  if (!listData || !listData.items) {
    return '<p>Liste verisi bulunamadı</p>';
  }

  const tag = listData.type === 'ordered' ? 'ol' : 'ul';
  const className = listData.type === 'ordered' 
    ? 'list-decimal list-inside space-y-1 my-4' 
    : 'list-disc list-inside space-y-1 my-4';

  let html = `<${tag} class="${className}">`;
  listData.items.forEach(item => {
    html += `<li class="text-gray-700">${item}</li>`;
  });
  html += `</${tag}>`;
  
  return html;
};

// Metin içeriğini HTML'e çevir
export const generateTextHTML = (text: string): string => {
  if (!text) return '';
  
  // Satır sonlarını <br> ile değiştir
  const formattedText = text.replace(/\n/g, '<br>');
  return `<div class="text-gray-700 leading-relaxed my-4">${formattedText}</div>`;
};

// Resim HTML'i oluştur
export const generateImageHTML = (imageUrl: string, alt: string = 'Image'): string => {
  if (!imageUrl) return '';
  
  // Eğer URL zaten tam URL ise kullan, değilse server URL'ini ekle
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
  
  return `
    <div class="image-container my-4">
      <img src="${fullUrl}" alt="${alt}" class="max-w-full h-auto rounded-lg shadow-md" />
    </div>
  `;
};

// Karışık içerik bloğu için HTML oluştur
export const generateMixedContentHTML = (
  title: string, 
  layout: 'vertical' | 'horizontal' | 'grid', 
  elements: ContentElement[]
): string => {
  let html = `<div class="mixed-content-block my-8 p-6 bg-gray-50 rounded-lg">`;
  
  if (title) {
    html += `<h3 class="text-xl font-semibold text-gray-800 mb-4">${title}</h3>`;
  }
  
  if (layout === 'vertical') {
    html += '<div class="space-y-4">';
    elements.forEach((element, index) => {
      const position = element.position || 'full';
      const width = element.width || '100%';
      
      // Konum göstergesi ekle
      let positionIndicator = '';
      if (position === 'left') {
        positionIndicator = '<div class="text-xs text-blue-600 mb-1">⬅️ Sol Konum</div>';
      } else if (position === 'right') {
        positionIndicator = '<div class="text-xs text-green-600 mb-1">➡️ Sağ Konum</div>';
      } else {
        positionIndicator = '<div class="text-xs text-purple-600 mb-1">🔄 Tam Genişlik</div>';
      }
      
      html += `<div class="relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white">`;
      html += positionIndicator;
      html += `<div class="text-xs text-gray-500 mb-2">📏 Boyut: ${width}</div>`;
      html += generateElementHTML(element);
      html += '</div>';
    });
    html += '</div>';
  } else if (layout === 'horizontal') {
    html += '<div class="flex flex-wrap gap-4">';
    elements.forEach((element, index) => {
      const width = element.width || '100%';
      const position = element.position || 'full';
      
      // Konum ve boyuta göre CSS sınıfları
      let cssClasses = '';
      if (position === 'left') {
        cssClasses = 'flex-shrink-0';
      } else if (position === 'right') {
        cssClasses = 'flex-shrink-0 ml-auto';
      } else {
        cssClasses = 'flex-1';
      }
      
      // Konum göstergesi ekle
      let positionIndicator = '';
      if (position === 'left') {
        positionIndicator = '<div class="text-xs text-blue-600 mb-1">⬅️ Sol Konum</div>';
      } else if (position === 'right') {
        positionIndicator = '<div class="text-xs text-green-600 mb-1">➡️ Sağ Konum</div>';
      } else {
        positionIndicator = '<div class="text-xs text-purple-600 mb-1">🔄 Tam Genişlik</div>';
      }
      
      html += `<div class="${cssClasses} relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white" style="min-width: ${width}; max-width: ${width};">`;
      html += positionIndicator;
      html += `<div class="text-xs text-gray-500 mb-2">📏 Boyut: ${width}</div>`;
      html += generateElementHTML(element);
      html += '</div>';
    });
    html += '</div>';
  } else if (layout === 'grid') {
    // Grid layout için konum ve boyut bilgilerini kullan
    html += '<div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">';
    elements.forEach((element, index) => {
      const width = element.width || '100%';
      const position = element.position || 'full';
      
      let gridClasses = '';
      if (position === 'left') {
        gridClasses = 'justify-self-start';
      } else if (position === 'right') {
        gridClasses = 'justify-self-end';
      } else {
        gridClasses = 'justify-self-stretch';
      }
      
      // Konum göstergesi ekle
      let positionIndicator = '';
      if (position === 'left') {
        positionIndicator = '<div class="text-xs text-blue-600 mb-1">⬅️ Sol Konum</div>';
      } else if (position === 'right') {
        positionIndicator = '<div class="text-xs text-green-600 mb-1">➡️ Sağ Konum</div>';
      } else {
        positionIndicator = '<div class="text-xs text-purple-600 mb-1">🔄 Tam Genişlik</div>';
      }
      
      html += `<div class="${gridClasses} relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white" style="width: ${width};">`;
      html += positionIndicator;
      html += `<div class="text-xs text-gray-500 mb-2">📏 Boyut: ${width}</div>`;
      html += generateElementHTML(element);
      html += '</div>';
    });
    html += '</div>';
  }
  
  html += '</div>';
  return html;
};

// Tek bir element için HTML oluştur
export const generateElementHTML = (element: ContentElement): string => {
  switch (element.type) {
    case 'text':
      return generateTextHTML(element.content);
    case 'table':
      return generateTableHTML(element.content);
    case 'list':
      return generateListHTML(element.content);
    case 'image':
      return generateImageHTML(element.content, 'Content Image');
    default:
      return '';
  }
};