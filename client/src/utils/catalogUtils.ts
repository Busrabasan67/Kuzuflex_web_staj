const API_BASE = "http://localhost:5000";

export const getCatalogUrl = (path: string) => {
  // Eğer path zaten /uploads ile başlıyorsa, sadece API_BASE ile birleştir
  if (path.startsWith('/uploads/')) {
    return `${API_BASE}${path}`;
  }
  // Eğer path uploads ile başlıyorsa (başında / yoksa), / ekle
  if (path.startsWith('uploads/')) {
    return `${API_BASE}/${path}`;
  }
  // Diğer durumlar için /uploads/ ekle
  return `${API_BASE}/uploads/${path}`;
}; 