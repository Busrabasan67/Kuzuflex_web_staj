import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

interface DynamicBreadcrumbData {
  productGroupName?: string;
  productName?: string;
  solutionName?: string;
  marketName?: string;
}

const Breadcrumb = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const [dynamicData, setDynamicData] = useState<DynamicBreadcrumbData>({});
  const [isLoading, setIsLoading] = useState(false);

  // Dinamik verileri API'den çek
  useEffect(() => {
    const fetchDynamicData = async () => {
      setIsLoading(true);
      try {
        // Ürün grubu sayfası için
        if (params.groupSlug && !params.productSlug) {
          try {
            const response = await fetch(`http://localhost:5000/api/product-groups/slug/${params.groupSlug}?lang=${i18n.language}`);
            if (response.ok) {
              const data = await response.json();
              setDynamicData(prev => ({
                ...prev,
                productGroupName: data.translation?.name || data.name || params.groupSlug
              }));
            } else {
              // Fallback olarak slug'ı kullan
              setDynamicData(prev => ({
                ...prev,
                productGroupName: params.groupSlug
              }));
            }
          } catch (error) {
            setDynamicData(prev => ({
              ...prev,
              productGroupName: params.groupSlug
            }));
          }
        }
        
        // Alt ürün sayfası için
        if (params.groupSlug && params.productSlug) {
          try {
            const response = await fetch(`http://localhost:5000/api/products/slug/${params.groupSlug}/${params.productSlug}?lang=${i18n.language}`);
            if (response.ok) {
              const data = await response.json();
              setDynamicData(prev => ({
                ...prev,
                productName: data.title || params.productSlug
              }));
            } else {
              setDynamicData(prev => ({
                ...prev,
                productName: params.productSlug
              }));
            }
          } catch (error) {
            setDynamicData(prev => ({
              ...prev,
              productName: params.productSlug
            }));
          }
        }
        
        // Çözüm sayfası için
        if (params.slug && location.pathname.includes('/solutions/')) {
          try {
            const response = await fetch(`http://localhost:5000/api/solutions/slug/${params.slug}?lang=${i18n.language}`);
            if (response.ok) {
              const data = await response.json();
              setDynamicData(prev => ({
                ...prev,
                solutionName: data.translation?.name || data.name || params.slug
              }));
            } else {
              setDynamicData(prev => ({
                ...prev,
                solutionName: params.slug
              }));
            }
          } catch (error) {
            setDynamicData(prev => ({
              ...prev,
              solutionName: params.slug
            }));
          }
        }
        
        // Pazar sayfası için
        if (params.slug && location.pathname.includes('/markets/')) {
          try {
            const response = await fetch(`http://localhost:5000/api/markets/slug/${params.slug}?language=${i18n.language}`);
            if (response.ok) {
              const data = await response.json();
              setDynamicData(prev => ({
                ...prev,
                marketName: data.name || params.slug
              }));
            } else {
              setDynamicData(prev => ({
                ...prev,
                marketName: params.slug
              }));
            }
          } catch (error) {
            setDynamicData(prev => ({
              ...prev,
              marketName: params.slug
            }));
          }
        }
      } catch (error) {
        console.error("Breadcrumb dinamik veri çekilemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicData();
  }, [location.pathname, params, i18n.language]);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Ana sayfa her zaman ilk
    breadcrumbs.push({
      label: t("breadcrumb.home"),
      path: "/",
      isActive: false,
    });

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Segment'e göre label belirle
      let label = segment;

      // Özel durumlar için label'ları çevir
      switch (segment) {
        case "about-us":
          label = t("breadcrumb.about");
          break;
        case "contact":
          label = t("breadcrumb.contact");
          break;
        case "products":
          label = t("breadcrumb.products");
          break;
        case "solutions":
          label = t("breadcrumb.solutions");
          break;
        case "qm-documents":
          label = t("breadcrumb.qmDocuments");
          break;
        case "markets":
          label = t("breadcrumb.markets");
          break;
        case "admin":
          label = t("breadcrumb.adminPanel");
          break;
        case "admin-login":
          label = t("breadcrumb.login");
          break;
        default:
          // Dinamik veriler için özel durumlar
          if (segment === params.groupSlug && dynamicData.productGroupName) {
            label = dynamicData.productGroupName;
          } else if (segment === params.productSlug && dynamicData.productName) {
            label = dynamicData.productName;
          } else if (segment === params.slug && dynamicData.solutionName) {
            label = dynamicData.solutionName;
          } else if (segment === params.slug && dynamicData.marketName) {
            label = dynamicData.marketName;
          }
          break;
      }

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Sadece ana sayfa ise breadcrumb gösterme
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 py-3 md:py-4 px-3 md:px-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((item, index) => (
            <li key={item.path} className="flex items-center flex-shrink-0">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mx-1 md:mx-2 flex-shrink-0" />
              )}
              
              {item.isActive ? (
                <span className="text-gray-900 font-semibold truncate max-w-[100px] md:max-w-[180px] px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                  {isLoading && (item.label === params.groupSlug || item.label === params.productSlug || item.label === params.slug) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      <span className="opacity-70">{item.label}</span>
                    </div>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-3 py-2 rounded-lg hover:shadow-sm border border-transparent hover:border-blue-200"
                >
                  {index === 0 ? (
                    <Home className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  ) : null}
                  <span className="truncate max-w-[100px] md:max-w-[180px]">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
