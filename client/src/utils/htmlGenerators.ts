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
  position?: 'left' | 'right' | 'full' | 'center';
  width?: '25%' | '33%' | '50%' | '66%' | '75%' | '100%';
  // Enhanced positioning
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  padding?: number;
  // Text styles
  fontSizePx?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter';
  // Image styles
  imageWidthPercent?: number;
  imageMaxHeightPx?: number;
  imageAlign?: 'left' | 'center' | 'right';
  imageFloat?: 'none' | 'left' | 'right';
  // Border and background
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
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
export const generateTextHTML = (text: string, opts?: { 
  lineHeight?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter';
}): string => {
  if (!text) return '';
  
  // HTML entity'leri decode et (JSON.stringify sırasında escape edilen karakterler)
  let decodedText = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Eğer decodedText hala çift tırnak içindeyse, tırnakları kaldır
  if (decodedText.startsWith('"') && decodedText.endsWith('"')) {
    decodedText = decodedText.slice(1, -1);
  }
  
  // Eğer decodedText zaten HTML içeriyorsa (RichTextEditor'dan geliyorsa)
  if (decodedText.includes('<') && decodedText.includes('>')) {
    // RichTextEditor'dan gelen HTML'deki TÜM inline stilleri koru
    // Bu HTML'de zaten renk, font, hizalama gibi stiller var
    
    // Uzun sözcükler taşmasın; break-all yerine break-words kullanarak doğal kelime böl
    const fontStyle = opts?.fontSizePx ? `font-size: ${opts.fontSizePx}px;` : '';
    
    // RichTextEditor'dan gelen HTML'de zaten tüm stiller var, sadece font boyutunu ekle
    // Eğer font boyutu belirtilmemişse, sadece wrapper div'i ekle
    if (fontStyle) {
      return `<div class="break-words whitespace-normal" style="${fontStyle}">${decodedText}</div>`;
    } else {
      return `<div class="break-words whitespace-normal">${decodedText}</div>`;
    }
  }
  
  // Sadece düz metin ise, satır sonlarını <br> ile değiştir ve div ile sar
  const formattedText = decodedText.replace(/\n/g, '<br>');
  const lineHeightStyle = opts?.lineHeight ? `line-height: ${opts.lineHeight};` : '';
  const fontWeightStyle = opts?.fontWeight && opts.fontWeight !== 'normal' ? `font-weight: ${opts.fontWeight};` : '';
  const combinedStyle = [lineHeightStyle, fontWeightStyle].filter(Boolean).join(' ');
  
  return `<div class="text-gray-700 leading-relaxed my-4 break-words whitespace-normal" style="${combinedStyle}">${formattedText}</div>`;
};

// Resim HTML'i oluştur
export const generateImageHTML = (
  image: string | { url: string; widthPercent?: number; maxHeightPx?: number; borderRadiusPx?: number },
  alt: string = 'Image',
  opts?: {
    widthPercent?: number;
    maxHeightPx?: number;
    align?: 'left' | 'center' | 'right';
    float?: 'none' | 'left' | 'right';
  }
): string => {
  if (!image) return '';
  const url = typeof image === 'string' ? image : image.url;
  const widthPercent = opts?.widthPercent || (typeof image === 'string' ? undefined : image.widthPercent);
  const maxHeightPx = opts?.maxHeightPx || (typeof image === 'string' ? undefined : image.maxHeightPx);
  const borderRadiusPx = typeof image === 'string' ? undefined : image.borderRadiusPx;
  const align = opts?.align || 'center';
  const float = opts?.float || 'none';

  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
  const style = [
    widthPercent ? `max-width:${widthPercent}%;` : '',
    maxHeightPx ? `max-height:${maxHeightPx}px;` : '',
    borderRadiusPx ? `border-radius:${borderRadiusPx}px;` : ''
  ].join('');

  // Alignment ve float için CSS sınıfları
  let containerClasses = 'image-container my-4';
  if (align === 'left') {
    containerClasses += ' flex justify-start';
  } else if (align === 'right') {
    containerClasses += ' flex justify-end';
  } else {
    containerClasses += ' flex justify-center';
  }
  
  if (float === 'left') {
    containerClasses += ' float-left mr-4 mb-2';
  } else if (float === 'right') {
    containerClasses += ' float-right ml-4 mb-2';
  }

  return `
    <div class="${containerClasses}">
      <img src="${fullUrl}" alt="${alt}" class="h-auto shadow-md" style="${style}" />
    </div>
  `;
};

// Karışık içerik bloğu için HTML oluştur
export const generateMixedContentHTML = (
  title: string,
  layout: 'vertical' | 'horizontal' | 'grid',
  elements: ContentElement[],
  options?: { preview?: boolean }
): string => {
  const showPreview = options?.preview === true;
  let html = `<div class="mixed-content-block my-8 p-6 bg-gray-50 rounded-lg">`;
  
  if (title) {
    html += `<h3 class="text-xl font-semibold text-gray-800 mb-4">${title}</h3>`;
  }
  
  if (layout === 'vertical') {
    html += '<div class="space-y-4">';
    elements.forEach((element) => {
      const position = element.position || 'full';
      const width = element.width || '100%';
      const wrapperClasses = showPreview
        ? 'relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white'
        : 'relative';
      html += `<div class="${wrapperClasses}">`;
      if (showPreview) {
        const positionIndicator = position === 'left'
          ? '<div class="text-xs text-blue-600 mb-1">⬅️ Sol Konum</div>'
          : position === 'right'
            ? '<div class="text-xs text-green-600 mb-1">➡️ Sağ Konum</div>'
            : '<div class="text-xs text-purple-600 mb-1">🔄 Tam Genişlik</div>';
        html += positionIndicator;
        html += `<div class="text-xs text-gray-500 mb-2">📏 Boyut: ${width}</div>`;
      }
      html += generateElementHTML(element);
      html += '</div>';
    });
    html += '</div>';
  } else if (layout === 'horizontal') {
    html += '<div class="flex flex-wrap gap-4">';
    elements.forEach((element) => {
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

      const wrapperClasses = showPreview
        ? `${cssClasses} relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white`
        : `${cssClasses}`;
      html += `<div class="${wrapperClasses}" style="min-width: ${width}; max-width: ${width};">`;
      if (showPreview) {
        const positionIndicator = position === 'left'
          ? '<div class="text-xs text-blue-600 mb-1">⬅️ Sol Konum</div>'
          : position === 'right'
            ? '<div class="text-xs text-green-600 mb-1">➡️ Sağ Konum</div>'
            : '<div class="text-xs text-purple-600 mb-1">🔄 Tam Genişlik</div>';
        html += positionIndicator;
        html += `<div class="text-xs text-gray-500 mb-2">📏 Boyut: ${width}</div>`;
      }
      html += generateElementHTML(element);
      html += '</div>';
    });
    html += '</div>';
  } else if (layout === 'grid') {
    // Grid layout için konum ve boyut bilgilerini kullan
    html += '<div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">';
    elements.forEach((element) => {
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

      const wrapperClasses = showPreview
        ? `${gridClasses} relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white`
        : `${gridClasses}`;
      html += `<div class="${wrapperClasses}" style="width: ${width};">`;
      if (showPreview) {
        const positionIndicator = position === 'left'
          ? '<div class="text-xs text-blue-600 mb-1">⬅️ Sol Konum</div>'
          : position === 'right'
            ? '<div class="text-xs text-green-600 mb-1">➡️ Sağ Konum</div>'
            : '<div class="text-xs text-purple-600 mb-1">🔄 Tam Genişlik</div>';
        html += positionIndicator;
        html += `<div class="text-xs text-gray-500 mb-2">📏 Boyut: ${width}</div>`;
      }
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
  // Element wrapper'ı için stil oluştur
  const elementStyles = [];
  
  if (element.marginTop !== undefined) elementStyles.push(`margin-top: ${element.marginTop}px`);
  if (element.marginBottom !== undefined) elementStyles.push(`margin-bottom: ${element.marginBottom}px`);
  if (element.marginLeft !== undefined) elementStyles.push(`margin-left: ${element.marginLeft}px`);
  if (element.marginRight !== undefined) elementStyles.push(`margin-right: ${element.marginRight}px`);
  if (element.padding !== undefined) elementStyles.push(`padding: ${element.padding}px`);
  if (element.borderWidth !== undefined && element.borderWidth > 0) {
    elementStyles.push(`border: ${element.borderWidth}px solid ${element.borderColor || '#e5e7eb'}`);
  }
  if (element.borderRadius !== undefined) elementStyles.push(`border-radius: ${element.borderRadius}px`);
  if (element.backgroundColor && element.backgroundColor !== 'transparent') {
    elementStyles.push(`background-color: ${element.backgroundColor}`);
  }
  
  const elementStyleString = elementStyles.length > 0 ? ` style="${elementStyles.join('; ')}"` : '';
  
  let elementHTML = '';
  switch (element.type) {
    case 'text':
      elementHTML = generateTextHTML(element.content, { 
        lineHeight: element.lineHeight,
        fontWeight: element.fontWeight
      });
      break;
    case 'table':
      elementHTML = generateTableHTML(element.content);
      break;
    case 'list':
      elementHTML = generateListHTML(element.content);
      break;
    case 'image':
      elementHTML = generateImageHTML(element.content, 'Content Image', {
        widthPercent: element.imageWidthPercent,
        maxHeightPx: element.imageMaxHeightPx,
        align: element.imageAlign,
        float: element.imageFloat
      });
      break;
    default:
      elementHTML = '';
  }
  
  // Eğer stil varsa wrapper div ile sar
  if (elementStyles.length > 0) {
    return `<div${elementStyleString}>${elementHTML}</div>`;
  }
  
  return elementHTML;
};