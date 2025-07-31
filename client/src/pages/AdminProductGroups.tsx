import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next'; // Kullanılmıyor, kaldırıldı

const API_BASE = "http://localhost:5000";

// Üst kategori (ProductGroup) tipini tanımlar
interface ProductGroup {
  id: number; // Grup ID'si
  imageUrl: string; // Grup görseli
  standard: string; // Grup standardı
  translations: {
    language: string; // Dil kodu
    name: string; // Grup adı (çeviri)
    description: string; // Grup açıklaması (çeviri)
  }[];
  productCount: number; // Alt ürün sayısı
}

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
  // Formun ortak alanları
  const [form, setForm] = useState({
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

  // Sayfa yüklendiğinde grupları getirir
  useEffect(() => {
    fetchGroups();
  }, []);

  // API'dan üst kategorileri çeker
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/product-groups/admin`);
      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }
      const data = await response.json();
      setGroups(data);
      setError(null);
    } catch (err) {
      console.error('❌ Grup verileri alınamadı:', err);
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Formdaki ortak alanlar değiştiğinde çalışır
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Çeviri alanları değiştiğinde çalışır
  const handleTranslationChange = (idx: number, field: 'name' | 'description', value: string) => {
    setTranslations(prev => prev.map((tr, i) => i === idx ? { ...tr, [field]: value } : tr));
  };

  // Form gönderildiğinde çalışır
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitMessage(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      formData.append("standard", form.standard);
      formData.append("translations", JSON.stringify(translations));

      const response = await fetch(`${API_BASE}/api/product-groups/formdata`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Kategori eklenemedi");

      await fetchGroups();
      setSubmitMessage("Kategori başarıyla eklendi!");
      setForm({ imageUrl: "", standard: "" });
      setTranslations(LANGUAGES.map(l => ({ language: l.code, name: "", description: "" })));
      setSelectedFile(null);
      setShowModal(false);
    } catch (err) {
      setSubmitMessage("Kategori eklenirken hata oluştu");
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
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Üst Kategori Yönetimi
        </h1>
        <p className="text-gray-600">
          Ürün gruplarını görüntüleyin, düzenleyin ve yönetin
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={() => setShowModal(true)}
          >
            + Yeni Kategori Ekle
          </button>
          <button
            onClick={fetchGroups}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Standart</label>
                <input
                  type="text"
                  name="standard"
                  value={form.standard}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ISO 9001"
                  required
                />
              </div>
              {/* 4 Dil için Çeviri Alanları */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGES.map((lang, idx) => (
                  <div key={lang.code} className="border rounded p-3">
                    <div className="font-semibold mb-2">{lang.label} ({lang.code})</div>
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
      )}

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Görsel
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  İsim
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                  Açıklama
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Standart
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Alt Ürün
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Çeviri
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{group.id}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {group.imageUrl ? (
                      <img
                        src={`${API_BASE}/${group.imageUrl.startsWith('/') ? group.imageUrl.slice(1) : group.imageUrl}`}
                        alt={group.translations[0]?.name || 'Görsel'}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="max-w-xs truncate" title={group.translations[0]?.name}>
                      {group.translations[0]?.name}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={group.translations[0]?.description || '-'}>
                      {group.translations[0]?.description || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={group.standard || '-'}>
                      {group.standard || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.productCount}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {group.translations.length}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white transition-colors px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
                        Düzenle
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white transition-colors px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
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
    </div>
  );
};

export default AdminProductGroups; 