import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next'; // Kullanılmıyor, kaldırıldı

const API_BASE = "http://localhost:5000";

// Üst kategori (ProductGroup) tipini tanımlar
interface ProductGroup {
  id: number; // Grup ID'si
  slug: string; // SEO dostu URL slug'ı
  imageUrl: string; // Grup görseli
  standard: string; // Grup standardı
  createdAt: string; // Oluşturulma tarihi
  updatedAt: string; // Güncellenme tarihi
  translations: {
    language: string; // Dil kodu
    name: string; // Grup adı (çeviri)
    description: string; // Grup açıklaması (çeviri)
  }[];
  turkishTranslation?: {
    language: string; // Dil kodu
    name: string; // Grup adı (çeviri)
    description: string; // Grup açıklaması (çeviri)
  }; // Türkçe çeviri için özel alan
  productCount: number; // Alt ürün sayısı
}

// Bayrak SVG'leri
const Flags = {
  tr: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="20" height="14">
      <rect width="300" height="200" fill="#E30A17" />
      <circle cx="120" cy="100" r="40" fill="#fff" />
      <circle cx="135" cy="100" r="32" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="170,100 159.5,106.5 162.5,94 152,86 164.5,86 170,74 175.5,86 188,86 177.5,94 180.5,106.5"
      />
    </svg>
  ),
  en: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="20" height="10">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="g">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#g)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  de: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="20" height="10">
      <rect y="0" width="60" height="10" fill="#000"/>
      <rect y="10" width="60" height="10" fill="#D00"/>
      <rect y="20" width="60" height="10" fill="#FFCE00"/>
    </svg>
  ),
  fr: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="20" height="10">
      <rect x="0" width="20" height="30" fill="#002395"/>
      <rect x="20" width="20" height="30" fill="#fff"/>
      <rect x="40" width="20" height="30" fill="#ED2939"/>
    </svg>
  )
};

// 4 desteklenen dil kodu
const LANGUAGES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const AdminProductGroups = () => {
  // const { t } = useTranslation(); // Çoklu dil desteği için hook
  const [groups, setGroups] = useState<ProductGroup[]>([]); // Üst kategori verileri
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState<string | null>(null); // Hata mesajı

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modal/form açma kapama durumu
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Düzenleme için seçili grup
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ProductGroup | null>(null);

  // Formun ortak alanları
  const [form, setForm] = useState({
    slug: '', // SEO dostu URL slug'ı
    imageUrl: '', // Görsel yolu
    standard: '', // Standart
  });
  // 4 dil için çeviri alanları
  const [translations, setTranslations] = useState(
    LANGUAGES.map(l => ({ language: l.code, name: '', description: '' }))
  );
  // Form gönderim yüklenme durumu
  const [submitLoading, setSubmitLoading] = useState(false);
  // Form gönderim sonrası mesaj
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  
  // Toast states
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  // Sayfa yüklendiğinde grupları getirir
  useEffect(() => {
    fetchGroups();
  }, []);

  // API'dan üst kategorileri çeker
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/product-groups/admin?lang=tr`);
      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }
      const data = await response.json();
      setGroups(data);
      setError(null);
    } catch (err) {
      console.error(' Grup verileri alınamadı:', err);
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: 'info', message: '' });
    }, 4000);
  };

  // Formdaki ortak alanlar değiştiğinde çalışır
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Çeviri alanları değiştiğinde çalışır
  const handleTranslationChange = (idx: number, field: 'name' | 'description', value: string) => {
    setTranslations(prev => prev.map((tr, i) => i === idx ? { ...tr, [field]: value } : tr));
    
    // İngilizce başlık değiştiğinde otomatik slug oluştur
    if (field === 'name' && idx === 1) { // İngilizce (ikinci dil)
      const englishName = value;
      const autoSlug = englishName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setForm(prev => ({ ...prev, slug: autoSlug }));
    }
  };

  // Düzenleme modalını açar ve verileri doldurur
  const handleEditClick = (group: ProductGroup) => {
    setEditingGroup(group);
    setForm({
      slug: group.slug || '',
      imageUrl: group.imageUrl,
      standard: group.standard,
    });
    setTranslations(
      LANGUAGES.map(lang => {
        const translation = group.translations.find(t => t.language === lang.code);
        return {
          language: lang.code,
          name: translation?.name || '',
          description: translation?.description || ''
        };
      })
    );
    setShowEditModal(true);
  };

  // Silme dialog'unu açar
  const handleDeleteClick = (group: ProductGroup) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  // Form gönderildiğinde çalışır (Yeni ekleme)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitMessage(null);

    try {
      // FormData ile kategori oluştur (resim dahil)
      const formData = new FormData();
      formData.append('slug', form.slug);
      formData.append('imageUrl', ''); // Başlangıçta boş
      formData.append('standard', form.standard);
      formData.append('translations', JSON.stringify(translations));
      
      // Resim seçilmişse ekle
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE}/api/product-groups/formdata`, {
        method: "POST",
        body: formData, // Content-Type header'ı otomatik olarak multipart/form-data olacak
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kategori eklenemedi");
      }

      const result = await response.json();
      console.log('ProductGroup başarıyla oluşturuldu:', result);

      await fetchGroups();
      showToast('success', 'Kategori başarıyla eklendi!');
      setForm({ slug: "", imageUrl: "", standard: "" });
      setTranslations(LANGUAGES.map(l => ({ language: l.code, name: "", description: "" })));
      setSelectedFile(null);
      setShowModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori eklenirken hata oluştu';
      showToast('error', errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Düzenleme form gönderildiğinde çalışır
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    setSubmitLoading(true);
    setSubmitMessage(null);

    try {
      // FormData ile kategori güncelle (resim dahil)
      const formData = new FormData();
      formData.append('slug', form.slug);
      formData.append('imageUrl', form.imageUrl); // Mevcut resim URL'si
      formData.append('standard', form.standard);
      formData.append('translations', JSON.stringify(translations));
      
      // Yeni resim seçilmişse ekle
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE}/api/product-groups/${editingGroup.id}`, {
        method: "PUT",
        body: formData, // Content-Type header'ı otomatik olarak multipart/form-data olacak
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kategori güncellenemedi");
      }

      const result = await response.json();
      console.log(' ProductGroup başarıyla güncellendi:', result);

      await fetchGroups();
      showToast('success', 'Kategori başarıyla güncellendi!');
      setForm({ slug: "", imageUrl: "", standard: "" });
      setTranslations(LANGUAGES.map(l => ({ language: l.code, name: "", description: "" })));
      setSelectedFile(null);
      setEditingGroup(null);
      setShowEditModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori güncellenirken hata oluştu';
      showToast('error', errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Silme işlemini gerçekleştirir
  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return;

    setSubmitLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/product-groups/${deletingGroup.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kategori silinemedi");
      }

      await fetchGroups();
      showToast('success', 'Kategori başarıyla silindi!');
      setDeletingGroup(null);
      setShowDeleteDialog(false);
    } catch (err: any) {
      const errorMessage = err.message || "Kategori silinirken hata oluştu";
      showToast('error', errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Yükleniyorsa yükleniyor ekranı göster
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-lg text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata varsa hata ekranı göster
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-5">😕</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Hata</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Üst Kategori Yönetimi
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Ürün gruplarını görüntüleyin, düzenleyin ve yönetin
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            onClick={() => setShowModal(true)}
          >
            + Yeni Kategori Ekle
          </button>
          <button
            onClick={fetchGroups}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            🔄 Yenile
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Toplam: {groups.length} kategori
        </div>
      </div>

      {/* Modal: Yeni Kategori Ekle */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Yeni Üst Kategori Ekle</h2>
            <form onSubmit={handleSubmit}>
              {/* Ortak Alanlar */}
                             <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
                 <input
                   type="text"
                   name="slug"
                   value={form.slug}
                   onChange={handleFormChange}
                   className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                   placeholder="metal-hortumlar"
                   required
                 />
                 <p className="text-xs text-gray-500">SEO dostu URL kısmı (zorunlu) - İngilizce başlığa göre otomatik oluşturulur</p>
               </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel Yolu</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  required
                />
                {selectedFile && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Önizleme"
                    className="h-16 w-16 object-cover rounded mb-2"
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Standart <span className="text-gray-400">(Opsiyonel)</span></label>
                <input
                  type="text"
                  name="standard"
                  value={form.standard}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ISO 9001"
                />
              </div>
              {/* 4 Dil için Çeviri Alanları */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGES.map((lang, idx) => (
                  <div key={lang.code} className="border rounded p-3">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-5 flex justify-center">
                        {Flags[lang.code as keyof typeof Flags]()}
                      </div>
                      {lang.label} ({lang.code})
                    </div>
                    <label className="block text-xs text-gray-600 mb-1">Başlık</label>
                    <input
                      type="text"
                      value={translations[idx].name}
                      onChange={e => handleTranslationChange(idx, 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                      placeholder={`${lang.label} başlık`}
                      required
                    />
                    <label className="block text-xs text-gray-600 mb-1">Açıklama</label>
                    <textarea
                      value={translations[idx].description}
                      onChange={e => handleTranslationChange(idx, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      placeholder={`${lang.label} açıklama`}
                      required
                    />
                  </div>
                ))}
              </div>
              {/* Gönder Butonu */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Ekleniyor...' : 'Kaydet'}
                </button>
              </div>
              {/* Sonuç Mesajı */}
              {submitMessage && (
                <div className="mt-3 text-center text-sm text-red-600">{submitMessage}</div>
              )}
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal: Kategori Düzenle */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => {
                setShowEditModal(false);
                setEditingGroup(null);
                setSelectedFile(null);
                // Form state'lerini temizle
                setForm({ slug: "", imageUrl: "", standard: "" });
                setTranslations(LANGUAGES.map(l => ({ language: l.code, name: "", description: "" })));
              }}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">✏️ Kategori Düzenle</h2>
            <form onSubmit={handleEditSubmit}>
              {/* Ortak Alanlar */}
                             <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
                 <input
                   type="text"
                   name="slug"
                   value={form.slug}
                   onChange={handleFormChange}
                   className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                   placeholder="metal-hortumlar"
                   required
                 />
                 <p className="text-xs text-gray-500">SEO dostu URL kısmı (zorunlu) - İngilizce başlığa göre otomatik oluşturulur</p>
               </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Görsel</label>
                {form.imageUrl && (
                  <img
                    src={`${API_BASE}/${form.imageUrl.startsWith('/') ? form.imageUrl.slice(1) : form.imageUrl}`}
                    alt="Mevcut görsel"
                    className="h-16 w-16 object-cover rounded mb-2"
                  />
                )}
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Görsel (İsteğe bağlı)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                />
                {selectedFile && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Yeni önizleme"
                    className="h-16 w-16 object-cover rounded mb-2"
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Standart <span className="text-gray-400">(Opsiyonel)</span></label>
                <input
                  type="text"
                  name="standard"
                  value={form.standard}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ISO 9001"
                />
              </div>
              {/* 4 Dil için Çeviri Alanları */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGES.map((lang, idx) => (
                  <div key={lang.code} className="border rounded p-3">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-5 flex justify-center">
                        {Flags[lang.code as keyof typeof Flags]()}
                      </div>
                      {lang.label} ({lang.code})
                    </div>
                    <label className="block text-xs text-gray-600 mb-1">Başlık</label>
                    <input
                      type="text"
                      value={translations[idx].name}
                      onChange={e => handleTranslationChange(idx, 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                      placeholder={`${lang.label} başlık`}
                      required
                    />
                    <label className="block text-xs text-gray-600 mb-1">Açıklama</label>
                    <textarea
                      value={translations[idx].description}
                      onChange={e => handleTranslationChange(idx, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      placeholder={`${lang.label} açıklama`}
                      required
                    />
                  </div>
                ))}
              </div>
              {/* Gönder Butonu */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGroup(null);
                    setSelectedFile(null);
                    // Form state'lerini temizle
                    setForm({ slug: "", imageUrl: "", standard: "" });
                    setTranslations(LANGUAGES.map(l => ({ language: l.code, name: "", description: "" })));
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
              {/* Sonuç Mesajı */}
              {submitMessage && (
                <div className="mt-3 text-center text-sm text-red-600">{submitMessage}</div>
              )}
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog: Silme Onayı */}
      {showDeleteDialog && deletingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-red-600">🗑️ Kategori Sil</h2>
            <p className="text-gray-700 mb-4">
              <strong>"{deletingGroup.translations[0]?.name}"</strong> kategorisini silmek istediğinizden emin misiniz?
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-800">
                ⚠️ Bu işlem geri alınamaz!
              </p>
              {deletingGroup.productCount > 0 && (
                <p className="text-sm text-red-800 mt-1">
                  Bu kategoriye bağlı <strong>{deletingGroup.productCount} adet alt ürün</strong> de silinecektir.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingGroup(null);
                }}
                disabled={submitLoading}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={handleDeleteConfirm}
                disabled={submitLoading}
              >
                {submitLoading ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  ID
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Görsel
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 md:w-40 lg:w-48">
                  İsim
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 md:w-32">
                  Slug
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 md:w-40 lg:w-48">
                  Açıklama
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 md:w-28">
                  Standart
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 md:w-24">
                  Alt Ürün
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 md:w-36">
                  TARIH
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 md:w-28">
                  İşlemler
                </th>
              </tr>
            </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{group.id}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    {group.imageUrl ? (
                      <img
                        src={`${API_BASE}/${group.imageUrl.startsWith('/') ? group.imageUrl.slice(1) : group.imageUrl}`}
                        alt={group.turkishTranslation?.name || group.translations[0]?.name || 'Görsel'}
                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 md:h-10 md:w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No</span>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="max-w-24 md:max-w-32 lg:max-w-48 truncate" title={group.turkishTranslation?.name || group.translations[0]?.name}>
                      {group.turkishTranslation?.name || group.translations[0]?.name}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-20 md:max-w-28 lg:max-w-32 truncate" title={group.slug || '-'}>
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                        {group.slug || '-'}
                      </code>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-500">
                    <div className="max-w-24 md:max-w-32 lg:max-w-48 truncate" title={group.turkishTranslation?.description || group.translations[0]?.description || '-'}>
                      {group.turkishTranslation?.description || group.translations[0]?.description || '-'}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-16 md:max-w-20 lg:max-w-28 truncate" title={group.standard && group.standard !== 'null' ? group.standard : '-'}>
                      {group.standard && group.standard !== 'null' ? group.standard : '-'}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.productCount}
                    </span>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Oluşturulma:</span>
                        <span className="text-xs">{group.createdAt ? new Date(group.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Güncelleme:</span>
                        <span className={`text-xs ${group.updatedAt !== group.createdAt ? 'text-blue-600 font-medium' : ''}`}>
                          {group.updatedAt ? new Date(group.updatedAt).toLocaleDateString('tr-TR') : '-'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleEditClick(group)}
                        className="bg-blue-500 hover:bg-blue-600 text-white transition-colors px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium shadow-sm"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(group)}
                        className="bg-red-500 hover:bg-red-600 text-white transition-colors px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium shadow-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {groups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kategori yok</h3>
            <p className="text-gray-500">İlk kategoriyi ekleyerek başlayın</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : toast.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setToast({ show: false, type: 'info', message: '' })}
                  className="inline-flex text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductGroups; 