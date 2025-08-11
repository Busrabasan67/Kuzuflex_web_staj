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
    { name: 'Küçük', value: '12px' },
    { name: 'Normal', value: '16px' },
    { name: 'Büyük', value: '20px' },
    { name: 'Çok Büyük', value: '24px' },
    { name: 'Başlık', value: '32px' }
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
    execCommand('fontSize', size.replace('px', ''));
    setFontSize(size);
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
          className="px-2 py-1 border border-gray-300 rounded text-xs"
        >
          {fonts.map(font => (
            <option key={font.value} value={font.value}>{font.name}</option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(e) => setSize(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs"
        >
          {fontSizes.map(size => (
            <option key={size.value} value={size.value}>{size.name}</option>
          ))}
        </select>

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
          fontSize,
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
