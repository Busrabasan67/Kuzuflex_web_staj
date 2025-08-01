import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCatalogUrl } from "../utils/catalogUtils";

const API_BASE = "http://localhost:5000";

interface Catalog {
  id: number;
  name: string;
  filePath: string;
}

interface ProductDetail {
  id: number;
  slug: string; // Ürün slug'ı
  groupId: number;
  groupSlug: string; // Grup slug'ı
  title: string;
  description: string;
  imageUrl: string;
  standard: string;
  catalogs?: Catalog[];
}

const SubProductPage = () => {
  const { t, i18n } = useTranslation();
  const { groupId, subId, groupSlug, productSlug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    // Slug varsa slug ile, yoksa ID ile çalış
    const isSlugMode = !!groupSlug && !!productSlug;
    
    if (isSlugMode) {
      // Slug bazlı veri çekme
      fetch(
        `${API_BASE}/api/products/slug/${groupSlug}/${productSlug}?lang=${i18n.language}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("API'den gelen veri (slug):", data);
          console.log("Resim URL:", data.imageUrl);
          if (data.catalogs) {
            console.log("Kataloglar:", data.catalogs);
            data.catalogs.forEach((catalog: Catalog, index: number) => {
              console.log(`Katalog ${index + 1}:`, {
                name: catalog.name,
                filePath: catalog.filePath,
                finalUrl: getCatalogUrl(catalog.filePath)
              });
            });
          }
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Ürün detay alınamadı (slug):", err);
          setLoading(false);
        });
    } else {
      // ID bazlı veri çekme (backward compatibility)
      fetch(
        `${API_BASE}/api/products?group=${groupId}&sub=${subId}&lang=${i18n.language}`
      )
        .then((res) => res.json())
        .then((data) => {
          // Fallback slug'lar ekle
          const productWithSlug = {
            ...data,
            slug: data.slug || `product-${data.id}`,
            groupSlug: data.groupSlug || `group-${data.groupId}`
          };
          
          if (data.catalogs) {
            data.catalogs.forEach((catalog: Catalog, index: number) => {
              console.log(`Katalog ${index + 1}:`, {
                name: catalog.name,
                filePath: catalog.filePath,
                finalUrl: getCatalogUrl(catalog.filePath)
              });
            });
          }
          setProduct(productWithSlug);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Ürün detay alınamadı (ID):", err);
          setLoading(false);
        });
    }
  }, [groupId, subId, groupSlug, productSlug, i18n.language]);

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#64748b',
          margin: 0
        }}>
          {t('loading.productInfo')}
        </p>
      </div>
    </div>
  );
  
  if (!product) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          😕
        </div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '12px'
        }}>
          {t('error.productNotFound')}
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          {t('error.productNotFoundDesc')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="sub-product-page" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
        marginBottom: '60px',
        backgroundColor: '#f8fafc',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Product Image */}
        <div style={{ textAlign: 'center' }}>
          {imageLoading && (
            <div 
              className="image-loading"
              style={{
                width: "100%", 
                maxWidth: "400px", 
                height: "300px",
                borderRadius: '16px',
                margin: '0 auto'
              }}
            ></div>
          )}
          <img
            src={`${API_BASE}/${product.imageUrl.startsWith('/') ? product.imageUrl.slice(1) : product.imageUrl}`}
            alt={product.title}
            style={{ 
              width: "100%", 
              maxWidth: "400px", 
              height: "auto", 
              objectFit: "cover",
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              imageRendering: '-webkit-optimize-contrast',
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
            loading="eager"
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              console.log("Resim yüklenemedi:", e);
              setImageLoading(false);
            }}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            {product.title}
          </h1>
          
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b', 
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            {product.description}
          </p>

          {product.standard && (
            <div style={{
              backgroundColor: '#e0f2fe',
              border: '1px solid #0284c7',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                fontSize: '1.2rem', 
                color: '#0284c7',
                fontWeight: '600'
              }}>
                📋 Standard:
              </span>
              <span style={{ 
                fontSize: '1rem', 
                color: '#0369a1',
                fontWeight: '500'
              }}>
                {product.standard}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Catalogs Section */}
      {product.catalogs && product.catalogs.length > 0 && (
        <div style={{ marginTop: '60px' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              📚 Kataloglar
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Ürünümüz hakkında detaylı bilgi ve teknik özellikler için kataloglarımızı inceleyebilirsiniz.
            </p>
          </div>

          <div className="catalog-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px'
          }}>
            {product.catalogs.map((catalog) => {
              const catalogUrl = getCatalogUrl(catalog.filePath);
              return (
                <div key={catalog.id} style={{ 
                  backgroundColor: 'white',
                  borderRadius: '16px', 
                  padding: '32px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                >
                  {/* PDF Icon Background */}
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    fontSize: '120px',
                    color: '#f1f5f9',
                    zIndex: 0
                  }}>
                    📄
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 20px 0', 
                      fontSize: '1.5rem', 
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      {catalog.name}
                    </h3>
                    
                    <p style={{
                      color: '#64748b',
                      marginBottom: '24px',
                      lineHeight: '1.5'
                    }}>
                      Detaylı teknik bilgiler ve ürün özellikleri
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedCatalog(catalog);
                          setShowPdfModal(true);
                        }}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        👁️ Görüntüle
                      </button>
                      
                      <a
                        href={catalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        ⬇️ İndir
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && selectedCatalog && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowPdfModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              width: '95%',
              height: '95%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 32px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: '#1e293b'
                }}>
                  {selectedCatalog.name}
                </h3>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#64748b',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕
              </button>
            </div>

            {/* PDF Content */}
            <div style={{ flex: 1, overflow: 'hidden', borderRadius: '0 0 20px 20px' }}>
              <iframe
                src={`${getCatalogUrl(selectedCatalog.filePath)}#toolbar=1&navpanes=1&scrollbar=1`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '0 0 20px 20px'
                }}
                title={selectedCatalog.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SubProductPage;
