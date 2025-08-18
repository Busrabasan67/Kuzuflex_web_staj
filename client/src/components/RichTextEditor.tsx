import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Metninizi yazın..." 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  const fonts = [
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Courier New', value: 'Courier New' }
  ];

  const fontSizes = [
    { name: '8px - Çok Küçük', value: '8px' },
    { name: '10px - Küçük', value: '10px' },
    { name: '12px - Normal Küçük', value: '12px' },
    { name: '14px - Küçük', value: '14px' },
    { name: '16px - Normal', value: '16px' },
    { name: '18px - Orta', value: '18px' },
    { name: '20px - Büyük', value: '20px' },
    { name: '24px - Çok Büyük', value: '24px' },
    { name: '28px - Başlık', value: '28px' },
    { name: '32px - Ana Başlık', value: '32px' },
    { name: '36px - Büyük Başlık', value: '36px' },
    { name: '48px - Çok Büyük Başlık', value: '48px' }
  ];

  // renk paleti ileride görsel palet butonunda kullanılabilir

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // İçerik zaten aynıysa DOM'u yeniden yazıp imleci bozma
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
    
    // Mevcut metin hizalamasını kontrol et ve state'i güncelle
    if (editor.innerHTML) {
      const computedStyle = window.getComputedStyle(editor);
      const currentAlign = computedStyle.textAlign as 'left' | 'center' | 'right' | 'justify';
      if (currentAlign && currentAlign !== textAlign) {
        setTextAlign(currentAlign);
      }
    }
  }, [value, textAlign]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleBold = () => {
    execCommand('bold');
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    execCommand('italic');
    setIsItalic(!isItalic);
  };

  const toggleUnderline = () => {
    execCommand('underline');
    setIsUnderline(!isUnderline);
  };

  const setColor = (color: string) => {
    execCommand('foreColor', color);
    setTextColor(color);
  };

  const setBgColor = (color: string) => {
    execCommand('hiliteColor', color);
    setBackgroundColor(color);
  };

  const setFont = (font: string) => {
    execCommand('fontName', font);
    setFontFamily(font);
  };

  const setSize = (size: string) => {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (range.toString()) {
        // Seçili metne font size uygula
        const span = document.createElement('span');
        span.setAttribute('style', `font-size: ${size} !important;`);
        span.innerHTML = range.toString();
        range.deleteContents();
        range.insertNode(span);
      } else {
        // Seçili metin yoksa, imlecin bulunduğu yere font size uygula
        const span = document.createElement('span');
        span.setAttribute('style', `font-size: ${size} !important;`);
        span.textContent = '\u200B'; // Zero-width space for cursor position
        range.insertNode(span);
        range.setStartAfter(span);
        range.setEndAfter(span);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Seçim yoksa, editörün başına font size uygula
      if (editorRef.current) {
        const span = document.createElement('span');
        span.setAttribute('style', `font-size: ${size} !important;`);
        span.textContent = '\u200B';
        editorRef.current.insertBefore(span, editorRef.current.firstChild);
        
        // İmleci yeni span'a taşı
        const newRange = document.createRange();
        newRange.setStart(span, 0);
        newRange.setEnd(span, 0);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    }
    
    setFontSize(size);
    editorRef.current?.focus();
    
    // Input event'ini tetikle
    setTimeout(() => {
      handleInput();
    }, 100);
  };



  const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    // Sadece hizalama komutunu uygula, diğer formatlamayı koru
    execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
    
    // State'i güncelle
    setTextAlign(align);
    
    // Editörü yeniden odakla
    editorRef.current?.focus();
  };

  // Liste ve link özellikleri kaldırıldı



  // Alternatif format temizleme yöntemi
  const clearAllFormatting = () => {
    if (editorRef.current) {
      // Kullanıcıdan onay al
      const confirmed = confirm('Tüm formatlamayı temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
      if (!confirmed) return;
      
      // Tüm HTML etiketlerini kaldır, sadece metni bırak
      const plainText = editorRef.current.innerText || editorRef.current.textContent || '';
      
      // Editörü temizle
      editorRef.current.innerHTML = '';
      
      // Düz metni ekle
      const textNode = document.createTextNode(plainText);
      editorRef.current.appendChild(textNode);
      
      // Editörü güncelle
      handleInput();
      
      // State'leri sıfırla
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setTextColor('#000000');
      setBackgroundColor('#ffffff');
      setFontSize('16px');
      setFontFamily('Arial');
      setTextAlign('left');
    }
  };

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Font Controls */}
        <select
          value={fontFamily}
          onChange={(e) => setFont(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-xs bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          title="Font Türü Seçin"
          style={{ minWidth: '120px' }}
        >
          {fonts.map(font => (
            <option key={font.value} value={font.value}>{font.name}</option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(e) => setSize(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-xs bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          title="Font Boyutu Seçin"
          style={{ fontSize: '12px', minWidth: '140px' }}
        >
          {fontSizes.map(size => (
            <option key={size.value} value={size.value} style={{ fontSize: '12px' }}>
              {size.name}
            </option>
          ))}
        </select>
        
        {/* Font Size Önizleme */}
        <div className="text-xs text-gray-500 ml-2">
          Seçili: <span className="font-medium" style={{ fontSize: fontSize }}>{fontSize}</span>
        </div>

        {/* Text Formatting */}
        <button
          onClick={toggleBold}
          className={`px-2 py-1 rounded text-xs ${isBold ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="Kalın"
        >
          <strong>B</strong>
        </button>

        <button
          onClick={toggleItalic}
          className={`px-2 py-1 rounded text-xs ${isItalic ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="İtalik"
        >
          <em>I</em>
        </button>

        <button
          onClick={toggleUnderline}
          className={`px-2 py-1 rounded text-xs ${isUnderline ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="Altı Çizili"
        >
          <u>U</u>
        </button>

        {/* Text Color */}
        <div className="relative">
          <input
            type="color"
            value={textColor}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
            title="Metin Rengi"
          />
        </div>

        {/* Background Color */}
        <div className="relative">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
            title="Arka Plan Rengi"
          />
        </div>

        {/* Alignment */}
        <button
          onClick={() => setAlignment('left')}
          className={`px-2 py-1 rounded text-xs ${textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="Sola Hizala"
        >
          ⬅️
        </button>

        <button
          onClick={() => setAlignment('center')}
          className={`px-2 py-1 rounded text-xs ${textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="Ortala"
        >
          ↔️
        </button>

        <button
          onClick={() => setAlignment('right')}
          className={`px-2 py-1 rounded text-xs ${textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="Sağa Hizala"
        >
          ➡️
        </button>

        <button
          onClick={() => setAlignment('justify')}
          className={`px-2 py-1 rounded text-xs ${textAlign === 'justify' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'}`}
          title="İki Yana Yasla"
        >
          ⬌
        </button>

        {/* Liste ve link butonları kaldırıldı */}

        {/* Clear All Formatting */}
        <button
          onClick={clearAllFormatting}
          className="px-2 py-1 bg-red-50 border border-red-300 rounded text-xs text-red-600 hover:bg-red-100"
          title="Tüm Formatlamayı Temizle"
        >
          🗑️
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 focus:outline-none"
        style={{
          fontFamily,
          fontSize: '16px', // Varsayılan font size - sadece editör için
          color: textColor,
          backgroundColor,
          textAlign: textAlign,
          direction: 'ltr'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
