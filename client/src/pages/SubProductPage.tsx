import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

interface Catalog {
  id: number;
  name: string;
  filePath: string;
  fileUrl?: string;
}

interface ProductDetail {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  standard: string;
  catalogs?: Catalog[];
}

const SubProductPage = () => {
  const { groupId, subId } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = "tr"; // çoklu dil varsa dinamik yapılabilir
    fetch(
      `${API_BASE}/api/products?group=${groupId}&sub=${subId}&lang=${lang}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ürün detay alınamadı:", err);
        setLoading(false);
      });
  }, [groupId, subId]);

  if (loading) return <p>Yükleniyor...</p>;
  if (!product) return <p>Ürün bulunamadı.</p>;

  return (
    <div className="sub-product-page">
      <img
        src={`${API_BASE}/uploads${product.imageUrl}`}
        alt={product.title}
        style={{ width: "300px", height: "300px", objectFit: "cover" }}
      />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <strong>Standard: {product.standard}</strong>
      {product.catalogs && product.catalogs.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Kataloglar</h3>
          <ul>
            {product.catalogs.map((catalog) => (
              <li key={catalog.id} style={{ marginBottom: 8 }}>
                <a
                  href={catalog.fileUrl ? `${API_BASE}/uploads/${catalog.fileUrl}` : `${API_BASE}/uploads/${catalog.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {catalog.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubProductPage;
