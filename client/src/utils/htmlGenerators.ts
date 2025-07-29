// HTML Generation utilities for content management

export interface TableData {
  headers: string[];
  rows: string[][];
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
  html += '<table class="min-w-full border border-gray-300 bg-white">';
  
  // Header
  html += '<thead><tr class="bg-gray-100">';
  tableData.headers.forEach(header => {
    html += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Body
  html += '<tbody>';
  tableData.rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`;
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
    elements.forEach(element => {
      html += generateElementHTML(element);
    });
    html += '</div>';
  } else if (layout === 'horizontal') {
    html += '<div class="flex flex-wrap gap-4">';
    elements.forEach(element => {
      const width = element.width || '50%';
      html += `<div style="flex: 1; min-width: ${width};">`;
      html += generateElementHTML(element);
      html += '</div>';
    });
    html += '</div>';
  } else if (layout === 'grid') {
    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
    elements.forEach(element => {
      html += generateElementHTML(element);
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