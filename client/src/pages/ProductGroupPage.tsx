// src/pages/ProductGroupPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const ProductGroupPage = () => {
  const { groupId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/product-groups/${groupId}/products?lang=tr`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [groupId]);

  return (
    <div>
      <h1>Ürünler</h1>
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductGroupPage;
