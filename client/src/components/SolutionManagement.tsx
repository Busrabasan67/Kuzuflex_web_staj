import React, { useState, useEffect } from 'react';
import SolutionModal from './SolutionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Solution {
  id: number;
  imageUrl: string;
  title: string;
  slug: string;
  description: string;
  hasExtraContent: boolean;
  createdAt: string;
  updatedAt: string;
}

const SolutionManagement: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-content' | 'without-content'>('all');
  
  // Modal state'leri
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<Solution | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  useEffect(() => {
    fetchSolutions();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: 'info', message: '' });
    }, 4000);
  };

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/solutions/admin');
      
      if (!response.ok) {
        throw new Error('Solutions fetch failed');
      }

      const data = await response.json();
      console.log('📋 SOLUTION MANAGEMENT - API\'den gelen veriler:', data);
      if (data.length > 0) {
        console.log('📋 SOLUTION MANAGEMENT - İlk solution örneği:', data[0]);
      }
      setSolutions(data);
    } catch (err) {
      showToast('error', 'Solution\'lar yüklenirken hata oluştu');
      console.error('Error fetching solutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSolution = async (formData: any) => {
    setSaving(true);

    try {
      console.log('🔄 SOLUTION MANAGEMENT - handleCreateSolution çağrıldı:', formData);
      
      // Modal'ı kapat
      setShowModal(false);
      
      // Listeyi yenile
      await fetchSolutions();
      
      showToast('success', 'Solution başarıyla oluşturuldu!');
    } catch (error) {
      console.error('❌ SOLUTION MANAGEMENT - Hata:', error);
      showToast('error', error instanceof Error ? error.message : 'Bilinmeyen hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSolution = async (formData: any) => {
    if (!editingSolution) return;

    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/solutions/${editingSolution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Solution güncellenirken hata oluştu');
      }

      showToast('success', 'Solution başarıyla güncellendi!');
      setEditingSolution(null);
      setShowModal(false);
      fetchSolutions(); // Listeyi yenile
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Bilinmeyen hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSolution = async (id: number) => {
    // Solution'ı bul
    const solution = solutions.find(s => s.id === id);
    if (!solution) return;

    // Modal'ı aç
    setSolutionToDelete(solution);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!solutionToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/solutions/${solutionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Solution silinirken hata oluştu');
      }

      const result = await response.json();
      
      // Detaylı başarı mesajı
      let successMessage = `"${solutionToDelete.title}" solution'ı başarıyla silindi!`;
      
      if (result.deletedItems) {
        const { translations, extraContents } = result.deletedItems;
        const details = [];
        
        if (translations > 0) {
          details.push(`${translations} çeviri`);
        }
        if (extraContents > 0) {
          details.push(`${extraContents} ekstra içerik`);
        }
        
        if (details.length > 0) {
          successMessage += `\n\nSilinen öğeler: ${details.join(', ')}`;
        }
      }

      showToast('success', successMessage);
      
      // Modal'ı kapat ve listeyi yenile
      setShowDeleteModal(false);
      setSolutionToDelete(null);
      fetchSolutions();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Bilinmeyen hata oluştu');
      setShowDeleteModal(false);
      setSolutionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSolutionToDelete(null);
  };

  const handleEditSolution = async (solution: Solution) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/solutions/admin/${solution.id}`);
      
      if (!response.ok) {
        throw new Error('Solution detayları yüklenemedi');
      }

      const solutionData = await response.json();
      setEditingSolution(solutionData);
      setShowModal(true);
    } catch (error) {
      showToast('error', 'Solution detayları yüklenirken hata oluştu');
      console.error('Error fetching solution details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSolution(null);
  };

  // Filtreleme ve arama
  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = solution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solution.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (solution.description && solution.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'with-content' && solution.hasExtraContent) ||
                         (filterType === 'without-content' && !solution.hasExtraContent);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: solutions.length,
    withContent: solutions.filter(s => s.hasExtraContent).length,
    withoutContent: solutions.filter(s => !s.hasExtraContent).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div>
            <div className="text-lg font-semibold text-gray-800">Solution'lar Yükleniyor</div>
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Solution Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">Çözümlerinizi yönetin ve organize edin</p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Solution Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Solution</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ekstra İçerikli</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withContent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ekstra İçeriksiz</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withoutContent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Solution ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü ({stats.total})
              </button>
              <button
                onClick={() => setFilterType('with-content')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterType === 'with-content'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ekstra İçerikli ({stats.withContent})
              </button>
              <button
                onClick={() => setFilterType('without-content')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterType === 'without-content'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ekstra İçeriksiz ({stats.withoutContent})
              </button>
            </div>
          </div>
        </div>

        {/* Solutions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Mevcut Solution'lar</h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredSolutions.length} solution bulundu
            </p>
          </div>
          
          <div className="overflow-x-auto min-w-full">
            {filteredSolutions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterType !== 'all' ? 'Sonuç bulunamadı' : 'Henüz solution eklenmemiş'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' 
                    ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                    : 'İlk solution\'ınızı eklemek için yukarıdaki butona tıklayın'
                  }
                </p>
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Görsel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                      Başlık
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                      Açıklama
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Ekstra İçerik
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                      Oluşturulma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                      Güncelleme
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSolutions.map((solution) => (
                    <tr key={solution.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap w-20">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-mono">
                          #{solution.id}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-24">
                        {solution.imageUrl ? (
                          <img 
                            src={`http://localhost:5000${solution.imageUrl}`} 
                            alt={solution.title}
                            className="h-14 w-14 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-56">
                        <div className="text-sm font-medium text-gray-900">
                          {solution.title}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-40">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-mono">
                          {solution.slug}
                        </span>
                      </td>
                      <td className="px-4 py-4 w-80">
                        <div className="max-w-full">
                          <p className="text-sm text-gray-900 line-clamp-2 leading-relaxed">
                            {solution.description || 'Açıklama bulunmuyor'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-28">
                        {solution.hasExtraContent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Var
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Yok
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-36">
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">
                            {new Date(solution.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(solution.createdAt).toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-36">
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">
                            {new Date(solution.updatedAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(solution.updatedAt).toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-36">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSolution(solution)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteSolution(solution.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : toast.type === 'error' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Solution Modal */}
      <SolutionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingSolution ? handleUpdateSolution : handleCreateSolution}
        onError={(message) => showToast('error', message)}
        loading={saving}
        initialData={editingSolution}
        isEdit={!!editingSolution}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        solution={solutionToDelete}
      />
    </div>
  );
};

export default SolutionManagement;