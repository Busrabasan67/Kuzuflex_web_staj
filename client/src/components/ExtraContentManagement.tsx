import React, { useState, useEffect } from 'react';
import SolutionExtraContentAdder from './SolutionExtraContentAdder';
import ExtraContentDeleteModal from './ExtraContentDeleteModal';

interface ExtraContent {
  id: number;
  type: string;
  title: string;
  content: string;
  order: number;
  language: string;
  solutionId: number;
  solutionTitle: string;
}

interface Solution {
  id: number;
  slug: string;
  title: string;
  hasExtraContent: boolean;
}

interface GroupedContent {
  solution: Solution;
  contents: ExtraContent[];
}

const ExtraContentManagement: React.FC = () => {
  const [extraContents, setExtraContents] = useState<ExtraContent[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [groupedContents, setGroupedContents] = useState<GroupedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdder, setShowAdder] = useState(false);
  const [editingContent, setEditingContent] = useState<ExtraContent | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Toast gösterme fonksiyonu
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000); // 5 saniye sonra otomatik kapat
  };

  // Yeni işlevsel state'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'table' | 'list' | 'mixed'>('all');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'tr' | 'en' | 'de' | 'fr'>('all');
  const [sortBy, setSortBy] = useState<'solution' | 'type' | 'order' | 'language'>('solution');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modal state'leri (sadece sağdaki toplu işlem modali)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{ ids: number[], label: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // İçerikleri solution'lara göre grupla ve filtrele
    let filteredContents = extraContents;

    // Arama filtreleme
    if (searchTerm) {
      filteredContents = filteredContents.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.solutionTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tür filtreleme
    if (filterType !== 'all') {
      filteredContents = filteredContents.filter(content => content.type === filterType);
    }

    // Dil filtreleme
    if (filterLanguage !== 'all') {
      filteredContents = filteredContents.filter(content => content.language === filterLanguage);
    }

    // Sıralama
    filteredContents.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'solution':
          aValue = a.solutionTitle;
          bValue = b.solutionTitle;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'order':
          aValue = a.order;
          bValue = b.order;
          break;
        case 'language':
          aValue = a.language;
          bValue = b.language;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const grouped = solutions.map(solution => {
      const solutionContents = filteredContents.filter(content => content.solutionId === solution.id);
      return {
        solution,
        contents: solutionContents
      };
    }).filter(group => group.contents.length > 0);

    setGroupedContents(grouped);
  }, [extraContents, solutions, searchTerm, filterType, filterLanguage, sortBy, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ekstra içerikleri ve solution'ları paralel olarak çek (cache busting)
      const ts = Date.now();
      const [contentsResponse, solutionsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/solution-extra-content/admin?ts=${ts}`, { cache: 'no-store' }),
        fetch(`http://localhost:5000/api/solutions/admin?ts=${ts}`, { cache: 'no-store' })
      ]);
      
      if (!contentsResponse.ok || !solutionsResponse.ok) {
        throw new Error('Data fetch failed');
      }

      const [contentsData, solutionsData] = await Promise.all([
        contentsResponse.json(),
        solutionsResponse.json()
      ]);

      setExtraContents(contentsData);
      setSolutions(solutionsData);
    } catch (err) {
      showToast('error', 'Veriler yüklenirken hata oluştu');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolutionExpansion = (solutionId: number) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  // Tekil düzenleme/silme kaldırıldı; sadece sağdaki toplu butonlar kullanılacak

  // Tüm dillerdeki içeriği düzenlemek için
  const handleEditContentGroup = (contents: ExtraContent[]) => {
    // İlk içeriği seç (düzenleme için referans olarak)
    const firstContent = contents[0];
    
    // Mevcut içerikleri düzenleme formuna yükle
    const existingContent = {
      ...firstContent,
      // Tüm dillerdeki mevcut içerikleri hazırla
      multiLanguageData: contents.reduce((acc, content) => {
        acc[content.language] = {
          title: content.title,
          content: content.content,
          type: content.type
        };
        return acc;
      }, {} as Record<string, any>)
    };
    
    setEditingContent(existingContent);
    setShowAdder(true);
  };

  // Verilen ID listesindeki içerikleri topluca sil (grup bazlı)
  const handleDeleteContentGroup = async (ids: number[], label: string) => {
    if (ids.length === 0) return;
    
    // Modal'ı aç
    setDeleteModalData({ ids, label });
    setShowDeleteModal(true);
  };

  // Modal'dan onay geldiğinde çalışacak fonksiyon
  const handleConfirmDelete = async () => {
    if (!deleteModalData) return;
    
    try {
      await Promise.all(
        deleteModalData.ids.map(id => fetch(`http://localhost:5000/api/solution-extra-content/${id}`, { method: 'DELETE' }))
      );
      showToast('success', `${deleteModalData.label} grubu silindi`);
      fetchData();
    } catch (error) {
      showToast('error', 'Toplu silme sırasında hata oluştu');
    } finally {
      setShowDeleteModal(false);
      setDeleteModalData(null);
    }
  };

  // Modal'ı kapat
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteModalData(null);
  };

  // Toplu işlemler
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`${selectedItems.size} öğeyi silmek istediğinizden emin misiniz?`)) return;
    
    try {
      await Promise.all(
        Array.from(selectedItems).map(id => 
          fetch(`http://localhost:5000/api/solution-extra-content/${id}`, { method: 'DELETE' })
        )
      );
      showToast('success', `${selectedItems.size} öğe başarıyla silindi!`);
      setSelectedItems(new Set());
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      showToast('error', 'Toplu silme sırasında hata oluştu');
    }
  };

  const toggleItemSelection = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllItems = () => {
    const allIds = extraContents.map(content => content.id);
    setSelectedItems(new Set(allIds));
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setShowBulkActions(false);
  };

  const handleContentAdded = () => {
    showToast('success', 'Ekstra içerik başarıyla eklendi!');
    setShowAdder(false);
    setEditingContent(null);
    fetchData(); // Listeyi yenile
  };

  const handleCancelAdder = () => {
    setShowAdder(false);
    setEditingContent(null);
    setMessage(null);
  };

  const getContentPreview = (content: ExtraContent) => {
    try {
      if (content.type === 'mixed') {
        // HTML içeriği için basit preview
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.content;
        return tempDiv.textContent?.substring(0, 100) + '...' || 'HTML içerik';
      } else if (content.type === 'text') {
        // JSON string'den text çıkar
        const textData = JSON.parse(content.content);
        return textData.substring(0, 100) + '...';
      } else if (content.type === 'table') {
        // JSON string'den tablo verisi çıkar
        const tableData = JSON.parse(content.content);
        return `Tablo: ${tableData.headers?.join(', ') || 'Veri yok'}`;
      } else if (content.type === 'list') {
        // JSON string'den liste verisi çıkar
        const listData = JSON.parse(content.content);
        return `Liste: ${listData.items?.join(', ') || 'Veri yok'}`;
      }
      return 'Bilinmeyen içerik türü';
    } catch (error) {
      return 'İçerik önizlenemiyor';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Metin';
      case 'table': return 'Tablo';
      case 'list': return 'Liste';
      case 'mixed': return 'Karışık';
      default: return type;
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'tr': return '🇹🇷';
      case 'en': return '🇬🇧';
      case 'de': return '🇩🇪';
      case 'fr': return '🇫🇷';
      default: return lang;
    }
  };

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'tr': return 'Türkçe';
      case 'en': return 'İngilizce';
      case 'de': return 'Almanca';
      case 'fr': return 'Fransızca';
      default: return lang;
    }
  };

  // Grup sayısını, dillerden bağımsız ve aynı order içinde birden fazla grup olma durumunu doğru hesaplayan yardımcı
  const computeGroupCount = (contents: ExtraContent[]): number => {
    // order -> language -> count
    const byOrder: Record<number, Record<string, number>> = {};
    contents.forEach((c) => {
      if (!byOrder[c.order]) byOrder[c.order] = {};
      const langCounts = byOrder[c.order];
      langCounts[c.language] = (langCounts[c.language] || 0) + 1;
    });
    // Her order için; dillerdeki maksimum adet kadar grup vardır
    return Object.values(byOrder).reduce((sum, langCounts) => {
      const counts = Object.values(langCounts);
      const maxPerOrder = counts.length > 0 ? Math.max(...counts) : 0;
      return sum + maxPerOrder;
    }, 0);
  };

  // İstatistikler (solution bazında doğru gruplayarak hesapla)
  const stats = {
    // Toplam ekstra içerik sayısı (dillerden bağımsız, gerçek grup adedi)
    total: solutions.reduce((sum, s) => {
      const contentsOfSolution = extraContents.filter(c => c.solutionId === s.id);
      return sum + computeGroupCount(contentsOfSolution);
    }, 0),
    // Dil versiyonları dahil toplam kayıt sayısı
    totalRecords: extraContents.length,
    byType: {
      text: solutions.reduce((sum, s) => sum + computeGroupCount(extraContents.filter(c => c.solutionId === s.id && c.type === 'text')), 0),
      table: solutions.reduce((sum, s) => sum + computeGroupCount(extraContents.filter(c => c.solutionId === s.id && c.type === 'table')), 0),
      list: solutions.reduce((sum, s) => sum + computeGroupCount(extraContents.filter(c => c.solutionId === s.id && c.type === 'list')), 0),
      mixed: solutions.reduce((sum, s) => sum + computeGroupCount(extraContents.filter(c => c.solutionId === s.id && c.type === 'mixed')), 0),
    },
    byLanguage: {
      tr: extraContents.filter(c => c.language === 'tr').length,
      en: extraContents.filter(c => c.language === 'en').length,
      de: extraContents.filter(c => c.language === 'de').length,
      fr: extraContents.filter(c => c.language === 'fr').length,
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div>
            <div className="text-lg font-semibold text-gray-800">Ekstra İçerikler Yükleniyor</div>
            <div className="text-sm text-gray-500">Lütfen bekleyin...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ekstra İçerik Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">Solution'larınızın ekstra içeriklerini yönetin</p>
              <p className="text-sm text-gray-500 mt-1">
                Toplam {stats.total} ekstra içerik bulunmaktadır ({stats.totalRecords} dil versiyonu)
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAdder(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Yeni İçerik Ekle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam İçerik</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">({stats.totalRecords} dil versiyonu)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Metin İçerik</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byType.text}</p>
                <p className="text-xs text-gray-500">({extraContents.filter(c => c.type === 'text').length} dil versiyonu)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tablo İçerik</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byType.table}</p>
                <p className="text-xs text-gray-500">({extraContents.filter(c => c.type === 'table').length} dil versiyonu)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Karışık İçerik</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byType.mixed}</p>
                <p className="text-xs text-gray-500">({extraContents.filter(c => c.type === 'mixed').length} dil versiyonu)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Liste İçerik</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byType.list}</p>
                <p className="text-xs text-gray-500">({extraContents.filter(c => c.type === 'list').length} dil versiyonu)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="İçerik veya solution ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Türler</option>
                <option value="text">Metin</option>
                <option value="table">Tablo</option>
                <option value="list">Liste</option>
                <option value="mixed">Karışık</option>
              </select>
              
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Diller</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="en">🇬🇧 İngilizce</option>
                <option value="de">🇩🇪 Almanca</option>
                <option value="fr">🇫🇷 Fransızca</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="solution">Solution'a Göre</option>
                <option value="type">Türe Göre</option>
                <option value="order">Sıraya Göre</option>
                <option value="language">Dile Göre</option>
              </select>
              
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-yellow-800">
                  {selectedItems.size} öğe seçildi
                </span>
                <button
                  onClick={selectAllItems}
                  className="text-sm text-yellow-700 hover:text-yellow-800 underline"
                >
                  Tümünü Seç
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-yellow-700 hover:text-yellow-800 underline"
                >
                  Seçimi Temizle
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Seçilenleri Sil
        </button>
      </div>
            </div>
          </div>
        )}

      {/* Mesaj */}
      {message && (
          <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* İçerik Ekleme Formu */}
      {showAdder && (
        <div className="mb-8">
          <SolutionExtraContentAdder 
            onContentAdded={handleContentAdded}
            onCancel={handleCancelAdder}
            editingContent={editingContent}
          />
        </div>
      )}

      {/* Solution Bazlı İçerik Listesi */}
      {!showAdder && (
        <div className="space-y-6">
          {groupedContents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Henüz Ekstra İçerik Yok</h3>
                  <p className="text-gray-400 mb-6">İlk ekstra içeriğinizi eklemek için yukarıdaki "Yeni İçerik Ekle" butonuna tıklayın.</p>
                  <button
                    onClick={() => setShowAdder(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    İlk İçeriği Ekle
                  </button>
              </div>
            </div>
          ) : (
            groupedContents.map((group) => (
                <div key={group.solution.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Solution Header */}
                <div 
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  onClick={() => toggleSolutionExpansion(group.solution.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {group.solution.title}
                      </h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {(() => {
                          // Gerçek içerik sayısını hesapla (solution bazında)
                          const byOrderBuckets: Record<number, Record<string, ExtraContent[]>> = {};
                          group.contents
                            .sort((a, b) => a.order - b.order || a.id - b.id)
                            .forEach((c) => {
                              if (!byOrderBuckets[c.order]) byOrderBuckets[c.order] = { tr: [], en: [], de: [], fr: [] } as any;
                              (byOrderBuckets[c.order][c.language] as ExtraContent[]).push(c);
                            });

                          const orders = Object.keys(byOrderBuckets).map(Number).sort((a, b) => a - b);
                          let totalContentGroups = 0;
                          orders.forEach((order) => {
                            const langLists = byOrderBuckets[order];
                            const maxLen = Math.max(
                              langLists.tr.length,
                              langLists.en.length,
                              langLists.de.length,
                              langLists.fr.length
                            );
                            totalContentGroups += maxLen;
                          });
                          return totalContentGroups;
                        })()} içerik
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {expandedSolutions.has(group.solution.id) ? 'Gizle' : 'Göster'}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedSolutions.has(group.solution.id) ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Solution Content */}
                {expandedSolutions.has(group.solution.id) && (
                  <div className="p-6">
                       {/* Order bazlı satırlar, diller sütunlar: İçerik 1, İçerik 2 ... */}
                       {(() => {
                         // 1) order -> language -> [contents]
                         const byOrderBuckets: Record<number, Record<string, ExtraContent[]>> = {};
                         group.contents
                           .sort((a, b) => a.order - b.order || a.id - b.id)
                           .forEach((c) => {
                             if (!byOrderBuckets[c.order]) byOrderBuckets[c.order] = { tr: [], en: [], de: [], fr: [] } as any;
                             (byOrderBuckets[c.order][c.language] as ExtraContent[]).push(c);
                           });

                         const orders = Object.keys(byOrderBuckets).map(Number).sort((a, b) => a - b);
                         if (orders.length === 0) return <div className="text-center text-gray-400">İçerik yok</div>;

                         // 2) Her order için; dillerdeki listelerin en uzunu kadar grup oluştur
                         type GroupRow = { label: string; ids: number[]; cells: Partial<Record<'tr'|'en'|'de'|'fr', ExtraContent>> };
                         const rows: GroupRow[] = [];
                         let contentIndex = 1; // İçerik numarası için sayaç
                         orders.forEach((order) => {
                           const langLists = byOrderBuckets[order];
                           const maxLen = Math.max(
                             langLists.tr.length,
                             langLists.en.length,
                             langLists.de.length,
                             langLists.fr.length
                           );
                           for (let i = 0; i < maxLen; i += 1) {
                             const tr = langLists.tr[i];
                             const en = langLists.en[i];
                             const de = langLists.de[i];
                             const fr = langLists.fr[i];
                             const label = `İçerik ${contentIndex}`;
                             const ids = [tr, en, de, fr].filter(Boolean).map((c) => (c as ExtraContent).id);
                             rows.push({ label, ids, cells: { tr, en, de, fr } });
                             contentIndex++; // Her grup için numarayı artır
                           }
                         });
                        
                        return (
                           <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50">
                                 <tr>
                                   <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">İçerik</th>
                                   <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">TR</th>
                                   <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">EN</th>
                                   <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">DE</th>
                                   <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">FR</th>
                                   <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Toplu</th>
                                 </tr>
                               </thead>
                               <tbody className="bg-white divide-y divide-gray-100">
                                 {rows.map((row, idx) => (
                                   <tr key={idx} className="hover:bg-gray-50 align-top">
                                     <td className="px-3 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">{row.label}</td>
                                     {(['tr', 'en', 'de', 'fr'] as const).map((lng) => {
                                       const content = row.cells[lng];
                                       return (
                                         <td key={lng} className="px-3 py-3 text-xs">
                                           {content ? (
                                             <div className="space-y-1 max-w-[280px]">
                                               <div className="flex items-center gap-2">
                                                 <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                                   content.type === 'text' ? 'bg-blue-100 text-blue-800' :
                                                   content.type === 'table' ? 'bg-purple-100 text-purple-800' :
                                                   content.type === 'list' ? 'bg-green-100 text-green-800' :
                                                   'bg-orange-100 text-orange-800'
                                                 }`}>
                                                   {getTypeLabel(content.type)}
                                                 </span>
                                                 <span className="text-[10px] text-gray-500">#{content.id}</span>
                                               </div>
                                               <div className="text-gray-900 font-medium truncate">{content.title}</div>
                                               <div className="text-gray-600 line-clamp-1">{getContentPreview(content)}</div>
                                               
                                                {/* Tek tek işlem butonları kaldırıldı */}
                                             </div>
                                           ) : (
                                             <span className="text-gray-400">—</span>
                                           )}
                                         </td>
                                       );
                                     })}
                                                                           <td className="px-3 py-3 text-xs whitespace-nowrap">
                                        <div className="flex flex-row gap-2">
                                          {/* Düzenle Butonu */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                              const groupContents = Object.values(row.cells).filter(Boolean) as ExtraContent[];
                                              handleEditContentGroup(groupContents);
                                        }}
                                            className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                      >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className="text-xs font-medium">Düzenle</span>
                                      </button>
                                          
                                          {/* Sil Butonu */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                              handleDeleteContentGroup(row.ids, row.label); 
                                        }}
                                            className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                      >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span className="text-xs font-medium">Sil</span>
                                      </button>
                                    </div>
                                      </td>
                                   </tr>
                                ))}
                               </tbody>
                             </table>
                          </div>
                        );
                       })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Silme Onay Modal'ı */}
      {showDeleteModal && deleteModalData && (
        <ExtraContentDeleteModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          contentLabel={deleteModalData.label}
          contentCount={deleteModalData.ids.length}
        />
      )}

      {/* Tek tek içerik silme modalı kaldırıldı */}

      {/* Toast Bildirimi */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`}>
            <div className="flex items-center space-x-2">
              <span>
                {toast.type === 'success' ? '✅' :
                 toast.type === 'error' ? '❌' :
                 'ℹ️'}
              </span>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ExtraContentManagement;