import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SubProductPage = () => {
  const { groupId, subId } = useParams();
  const [subProduct, setSubProduct] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/product-groups/${groupId}/products?lang=tr`)
      .then(res => res.json())
      .then(data => {
        const product = data.find((p: any) => p.id == subId); // subId’ye göre ürünü bul
        setSubProduct(product);
      });
  }, [groupId, subId]);

  if (!subProduct) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{subProduct.title}</h1>
      <p className="text-lg mb-2">{subProduct.description}</p>
    </div>
  );
};

export default SubProductPage;
