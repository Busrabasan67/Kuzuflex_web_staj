import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Market } from "../entity/Market";
import { MarketTranslation } from "../entity/MarketTranslation";
import { MarketContent } from "../entity/MarketContent";
import { ProductGroup } from "../entity/ProductGroup";
import { Product } from "../entity/Product";
import { Solution } from "../entity/Solution";
import { getAllGroups } from "./productGroupController";
import { getAllSolutions } from "./solutionController";
import { In } from "typeorm";
import * as fs from "fs";
import * as path from "path";

// Dosya silme yardımcı fonksiyonu
const deleteFileIfExists = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Dosya silindi: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
    return false;
  }
};

// Dosya yolu oluşturma yardımcı fonksiyonu
const getPublicFilePath = (relativePath: string) => {
  // __dirname: server/src/controllers
  // İhtiyacımız: server/public
  return path.join(__dirname, "../../public", relativePath);
};

// URL'den solution ID'sini çıkar
const extractSolutionIdFromUrl = (url: string | undefined): number | null => {
  if (!url) return null;
  const match = url.match(/\/solutions\/(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const marketRepository = AppDataSource.getRepository(Market);
const marketTranslationRepository = AppDataSource.getRepository(MarketTranslation);
const marketContentRepository = AppDataSource.getRepository(MarketContent);
const productGroupRepository = AppDataSource.getRepository(ProductGroup);
const productRepository = AppDataSource.getRepository(Product);

export const getAllMarkets = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.query;
    
    // Admin paneli için tüm marketleri getir (isActive filtresi olmadan)
    const isAdmin = req.query.admin === 'true';
    
    const markets = await marketRepository.find({
      where: isAdmin ? {} : { isActive: true },
      relations: ['translations', 'contents'],
      order: { order: 'ASC' }
    });

    const marketsWithTranslations = await Promise.all(markets.map(async (market: Market) => {
      const translation = market.translations.find((t: MarketTranslation) => t.language === language);
      
      const contents = await Promise.all(market.contents.map(async (content: MarketContent) => {
        let name = '';

        // Eğer productGroupId varsa, ProductGroup'tan isim al
        if (content.productGroupId) {
          const productGroup = await productGroupRepository.findOne({
            where: { id: content.productGroupId },
            relations: ['translations']
          });
          if (productGroup) {
            const productGroupTranslation = productGroup.translations?.find((t: any) => t.language === language);
            name = productGroupTranslation?.name || '';
          }
        }

        // Eğer productId varsa, Product'tan isim al
        if (content.productId) {
          const product = await productRepository.findOne({
            where: { id: content.productId },
            relations: ['translations']
          });
          if (product) {
            const productTranslation = product.translations?.find((t: any) => t.language === language);
            name = productTranslation?.title || '';
          }
        }

        return {
          id: content.id,
          type: content.type,
          name: name,
          targetUrl: content.targetUrl,
          order: content.order
        };
      }));

      return {
        id: market.id,
        slug: market.slug,
        imageUrl: market.imageUrl ? (market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`) : null,
        order: market.order,
        isActive: market.isActive,
        hasProducts: market.hasProducts,
        hasSolutions: market.hasSolutions,
        hasCertificates: market.hasCertificates,
        name: translation?.name || '',
        description: translation?.description || '',
        contents: contents.sort((a: any, b: any) => a.order - b.order)
      };
    }));

    res.json(marketsWithTranslations);
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMarketBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { language = 'en' } = req.query;

    console.log('🔍 Market getiriliyor:', { slug, language });

    const market = await marketRepository.findOne({
      where: { slug },
      relations: ['translations', 'contents', 'productGroups', 'solutions']
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const translation = market.translations.find((t: MarketTranslation) => t.language === language);
    console.log('📦 Market bulundu:', { id: market.id, slug: market.slug });
    console.log('📦 Market çevirisi:', translation);
    
    const contents = await Promise.all(market.contents.map(async (content: MarketContent) => {
      let name = '';

      console.log('🔍 İçerik işleniyor:', { 
        id: content.id, 
        type: content.type, 
        productGroupId: content.productGroupId, 
        productId: content.productId 
      });

      // Eğer productGroupId varsa, ProductGroup'tan isim al
      if (content.productGroupId) {
        const productGroup = await productGroupRepository.findOne({
          where: { id: content.productGroupId },
          relations: ['translations']
        });
        if (productGroup) {
          const productGroupTranslation = productGroup.translations?.find((t: any) => t.language === language);
          name = productGroupTranslation?.name || '';
          console.log('📦 ProductGroup çevirisi:', { 
            groupId: content.productGroupId, 
            translation: productGroupTranslation, 
            finalName: name 
          });
        }
      }

      // Eğer productId varsa, Product'tan isim al
      if (content.productId) {
        const product = await productRepository.findOne({
          where: { id: content.productId },
          relations: ['translations']
        });
        if (product) {
          const productTranslation = product.translations?.find((t: any) => t.language === language);
          name = productTranslation?.title || '';
          console.log('📦 Product çevirisi:', { 
            productId: content.productId, 
            translation: productTranslation, 
            finalName: name 
          });
        }
      }

      // Eğer solution ise, Solution'tan isim al
      if (content.type === 'solution') {
        let solutionId = content.solutionId;
        
        // Eğer solutionId yoksa, URL'den çıkar
        if (!solutionId) {
          solutionId = extractSolutionIdFromUrl(content.targetUrl) || undefined;
        }
        
        if (solutionId) {
          const solution = await AppDataSource.getRepository(Solution).findOne({
            where: { id: solutionId },
            relations: ['translations']
          });
          if (solution) {
            const solutionTranslation = solution.translations?.find((t: any) => t.language === language);
            name = solutionTranslation?.title || '';
            console.log('📦 Solution çevirisi:', { 
              solutionId, 
              translation: solutionTranslation, 
              finalName: name 
            });
          }
        }
      }

      return {
        id: content.id,
        type: content.type,
        name: name,
        targetUrl: content.targetUrl,
        order: content.order
      };
    }));

    const marketData = {
      id: market.id,
      slug: market.slug,
      imageUrl: market.imageUrl ? (market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`) : null,
      order: market.order,
      hasProducts: market.hasProducts,
      hasSolutions: market.hasSolutions,
      hasCertificates: market.hasCertificates,
      name: translation?.name || '',
      description: translation?.description || '',
              contents: contents.sort((a: any, b: any) => a.order - b.order),
      productGroups: market.productGroups,
      solutions: market.solutions
    };

    res.json(marketData);
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Market ID ile getirme endpoint'i
export const getMarketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const market = await marketRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['translations']
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Market verilerini hazırla
    const marketData = {
      id: market.id,
      slug: market.slug,
      imageUrl: market.imageUrl ? (market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`) : null,
      order: market.order,
      isActive: market.isActive,
      hasProducts: market.hasProducts,
      hasSolutions: market.hasSolutions,
      hasCertificates: market.hasCertificates,
      translations: market.translations || []
    };

    res.json(marketData);
  } catch (error) {
    console.error('Error getting market by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Market oluşturma sonrası otomatik içerik ekleme
const createDefaultMarketContents = async (marketId: number, hasProducts: boolean, hasSolutions: boolean, hasCertificates: boolean, selectedProductGroups?: number[], selectedProducts?: number[], selectedSolutions?: number[]) => {
  try {
    console.log('🔧 Market için otomatik içerikler oluşturuluyor...');
    console.log('📊 Parametreler:', {
      marketId,
      hasProducts,
      hasSolutions,
      hasCertificates,
      selectedProductGroups,
      selectedProducts,
      selectedSolutions
    });
    
    const contents = [];
    let order = 1;

    // Sertifikalar her zaman eklenir
    if (hasCertificates) {
      contents.push({
        type: 'certificate',
        targetUrl: '/qm-documents',
        order: order++
      });
    }

    // İletişim her zaman eklenir
    contents.push({
      type: 'contact',
      targetUrl: '/iletisim',
      order: order++
    });

    // About Us kaldırıldı - artık eklenmeyecek

    // Ürün grupları varsa ekle
    if (hasProducts) {
      let productGroups;
      
      if (selectedProductGroups && selectedProductGroups.length > 0) {
        // Sadece seçilen ürün gruplarını getir
        productGroups = await productGroupRepository.find({
          where: { id: In(selectedProductGroups) },
          relations: ['translations']
        });
      } else {
        // Tüm ürün gruplarını getir
        productGroups = await productGroupRepository.find({
          relations: ['translations']
        });
      }

      for (const group of productGroups) {
        const translation = group.translations?.find(t => t.language === 'en');
        if (translation) {
          contents.push({
            type: 'product',
            targetUrl: `/products/${group.slug}`,
            productGroupId: group.id,
            order: order++
          });
        }
      }

      // Alt ürünler varsa ekle
      if (selectedProducts && selectedProducts.length > 0) {
        console.log('🔍 Alt ürünler işleniyor:', selectedProducts);
        
        const products = await productRepository.find({
          where: { id: In(selectedProducts) },
          relations: ['translations', 'group']
        });

        console.log('📦 Bulunan ürünler:', products.length);
        
        for (const product of products) {
          const translation = product.translations?.find(t => t.language === 'en');
          console.log('🔍 Ürün işleniyor:', {
            id: product.id,
            slug: product.slug,
            groupSlug: product.group?.slug,
            translation: translation?.title
          });
          
          if (translation && product.group?.slug && product.slug) {
            contents.push({
              type: 'product',
              targetUrl: `/products/${product.group.slug}/${product.slug}`,
              productId: product.id,
              order: order++
            });
            console.log('✅ Ürün içeriği eklendi:', product.slug);
          } else {
            console.log('❌ Ürün eklenmedi - eksik veri:', {
              hasTranslation: !!translation,
              hasGroupSlug: !!product.group?.slug,
              hasSlug: !!product.slug
            });
          }
        }
      } else {
        console.log('⚠️ Alt ürün seçimi yok veya boş');
      }
    }

    // Çözümler varsa ekle
    if (hasSolutions) {
      let solutions;
      
      if (selectedSolutions && selectedSolutions.length > 0) {
        // Sadece seçilen çözümleri getir
        solutions = await AppDataSource.getRepository(Solution).find({
          where: { id: In(selectedSolutions) },
          relations: ['translations']
        });
      } else {
        // Tüm çözümleri getir
        solutions = await AppDataSource.getRepository(Solution).find({
          relations: ['translations']
        });
      }

      for (const solution of solutions) {
        const translation = solution.translations?.find(t => t.language === 'en');
        if (translation) {
          contents.push({
            type: 'solution',
            targetUrl: `/solutions/${solution.slug}`,
            solutionId: solution.id,
            order: order++
          });
        }
      }
    }

    // İçerikleri kaydet
    for (const contentData of contents) {
      const content = new MarketContent();
      content.type = contentData.type;
      content.targetUrl = contentData.targetUrl;
      content.productGroupId = contentData.productGroupId;
      content.productId = contentData.productId;
      content.solutionId = contentData.solutionId;
      content.order = contentData.order;
      content.market = { id: marketId } as Market;

      await marketContentRepository.save(content);
      console.log(`✅ İçerik eklendi: ${contentData.type}`, {
        type: contentData.type,
        productGroupId: contentData.productGroupId,
        productId: contentData.productId,
        solutionId: contentData.solutionId,
        targetUrl: contentData.targetUrl
      });
    }

    console.log(`✅ Toplam ${contents.length} içerik eklendi`);
  } catch (error) {
    console.error('❌ Otomatik içerik oluşturma hatası:', error);
  }
};

export const createMarket = async (req: Request, res: Response) => {
  try {
    console.log('📥 Market oluşturma isteği:', req.body);
    
    const { slug, imageUrl, order, hasProducts, hasSolutions, hasCertificates, translations, selectedProductGroups, selectedProducts, selectedSolutions } = req.body;

    const market = new Market();
    market.slug = slug;
    market.imageUrl = imageUrl;
    market.order = order || 0;
    market.hasProducts = hasProducts || false;
    market.hasSolutions = hasSolutions || false;
    market.hasCertificates = hasCertificates || false;

    console.log('🏗️ Market entity oluşturuldu:', {
      slug: market.slug,
      imageUrl: market.imageUrl,
      order: market.order,
      hasProducts: market.hasProducts,
      hasSolutions: market.hasSolutions,
      hasCertificates: market.hasCertificates
    });

    // Translations
    if (translations && Array.isArray(translations)) {
      console.log('🌐 Translations işleniyor:', translations);
      market.translations = translations.map((trans: any) => {
        const translation = new MarketTranslation();
        translation.language = trans.language;
        translation.name = trans.name;
        translation.description = trans.description;
        console.log('🌐 Translation oluşturuldu:', {
          language: translation.language,
          name: translation.name,
          description: translation.description
        });
        return translation;
      });
    }

    console.log('💾 Market veritabanına kaydediliyor...');
    const savedMarket = await marketRepository.save(market);
    console.log('✅ Market başarıyla kaydedildi:', savedMarket);

    // Otomatik içerikler oluştur
    await createDefaultMarketContents(savedMarket.id, hasProducts, hasSolutions, hasCertificates, selectedProductGroups, selectedProducts, selectedSolutions);

    res.status(201).json(savedMarket);
  } catch (error) {
    console.error('❌ Market oluşturma hatası:', error);
    console.error('❌ Hata detayları:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateMarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slug, imageUrl, order, isActive, hasProducts, hasSolutions, hasCertificates, translations, selectedProductGroups, selectedProducts, selectedSolutions } = req.body;

    console.log('📥 Market güncelleme isteği:', {
      id,
      hasProducts,
      hasSolutions,
      hasCertificates,
      selectedProductGroups,
      selectedProducts,
      selectedSolutions
    });

    const market = await marketRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['translations']
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    market.slug = slug || market.slug;
    market.imageUrl = imageUrl || market.imageUrl;
    market.order = order !== undefined ? order : market.order;
    market.isActive = isActive !== undefined ? isActive : market.isActive;
    market.hasProducts = hasProducts !== undefined ? hasProducts : market.hasProducts;
    market.hasSolutions = hasSolutions !== undefined ? hasSolutions : market.hasSolutions;
    market.hasCertificates = hasCertificates !== undefined ? hasCertificates : market.hasCertificates;

    // Update translations
    if (translations && Array.isArray(translations)) {
      // Remove existing translations
      await marketTranslationRepository.delete({ market: { id: market.id } });
      
      // Add new translations
      market.translations = translations.map((trans: any) => {
        const translation = new MarketTranslation();
        translation.language = trans.language;
        translation.name = trans.name;
        translation.description = trans.description;
        return translation;
      });
    }

    const updatedMarket = await marketRepository.save(market);

    // İçerik seçimleri varsa, mevcut içerikleri sil ve yenilerini oluştur
    if (selectedProductGroups !== undefined || selectedProducts !== undefined || selectedSolutions !== undefined) {
      console.log('🔄 Market içerikleri güncelleniyor...');
      
      // Mevcut içerikleri sil
      await marketContentRepository.delete({ market: { id: market.id } });
      
      // Yeni içerikleri oluştur
      await createDefaultMarketContents(
        market.id,
        hasProducts,
        hasSolutions,
        hasCertificates,
        selectedProductGroups,
        selectedProducts,
        selectedSolutions
      );
    }

    res.json(updatedMarket);
  } catch (error) {
    console.error('Error updating market:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Market silme işlemi başlatıldı, ID:', id);
    
    const market = await marketRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['translations', 'contents']
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    console.log('🔍 Market bulundu:', market.id, market.slug);

    // 1. Önce market translations'ları sil
    if (market.translations && market.translations.length > 0) {
      console.log('🗑️ Market translations siliniyor...');
      await marketTranslationRepository.delete({ market: { id: market.id } });
    }

    // 2. Market contents'leri sil
    if (market.contents && market.contents.length > 0) {
      console.log('🗑️ Market contents siliniyor...');
      await marketContentRepository.delete({ market: { id: market.id } });
    }

    // 3. Market resmini sil (eğer varsa)
    if (market.imageUrl) {
      console.log('🗑️ Market resmi siliniyor:', market.imageUrl);
      const imagePath = getPublicFilePath(market.imageUrl);
      deleteFileIfExists(imagePath);
    }

    // 4. Market'i sil
    console.log('🗑️ Market siliniyor...');
    await marketRepository.remove(market);
    
    console.log('✅ Market başarıyla silindi');
    res.json({ message: 'Market deleted successfully' });
  } catch (error) {
    console.error('❌ Market silme hatası:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Market Content CRUD operations
export const createMarketContent = async (req: Request, res: Response) => {
  try {
    const { marketId } = req.params;
    const { type, targetUrl, productGroupId, productId, order } = req.body;

    const market = await marketRepository.findOne({
      where: { id: parseInt(marketId) }
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const content = new MarketContent();
    content.type = type;
    content.targetUrl = targetUrl;
    content.productGroupId = productGroupId;
    content.productId = productId;
    content.order = order || 0;
    content.market = market;

    const savedContent = await marketContentRepository.save(content);
    res.status(201).json(savedContent);
  } catch (error) {
    console.error('Error creating market content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMarketContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, targetUrl, productGroupId, productId, order } = req.body;

    const content = await marketContentRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!content) {
      return res.status(404).json({ error: 'Market content not found' });
    }

    content.type = type || content.type;
    content.targetUrl = targetUrl || content.targetUrl;
    content.productGroupId = productGroupId || content.productGroupId;
    content.productId = productId || content.productId;
    content.order = order !== undefined ? order : content.order;

    const updatedContent = await marketContentRepository.save(content);
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating market content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMarketContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const content = await marketContentRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!content) {
      return res.status(404).json({ error: 'Market content not found' });
    }

    await marketContentRepository.remove(content);
    res.json({ message: 'Market content deleted successfully' });
  } catch (error) {
    console.error('Error deleting market content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 

// Market içeriklerini getir
export const getMarketContents = async (req: Request, res: Response) => {
  try {
    const { marketId } = req.params;
    
    const contents = await marketContentRepository.find({
      where: { market: { id: parseInt(marketId) } },
      order: { order: 'ASC' }
    });

    console.log(' Market contents fetched:', contents.map(c => ({
      id: c.id,
      type: c.type,
      productGroupId: c.productGroupId,
      productId: c.productId,
      solutionId: c.solutionId,
      targetUrl: c.targetUrl
    })));

    res.json(contents);
  } catch (error) {
    console.error('Error fetching market contents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mevcut ürün gruplarını getir - Mevcut controller fonksiyonunu kullan
export const getAvailableProductGroups = async (req: Request, res: Response) => {
  try {
    // Mevcut getAllGroups fonksiyonunu çağır
    await getAllGroups(req, res);
  } catch (error) {
    console.error('Error fetching product groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mevcut çözümleri getir - Mevcut controller fonksiyonunu kullan
export const getAvailableSolutions = async (req: Request, res: Response) => {
  try {
    // Mevcut getAllSolutions fonksiyonunu çağır
    await getAllSolutions(req, res);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Market'in imageUrl alanını güncelle
export const updateMarketImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const market = await marketRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Eski resim dosyasını sil
    if (market.imageUrl && market.imageUrl !== imageUrl) {
      const oldImagePath = getPublicFilePath(market.imageUrl);
      const deleted = deleteFileIfExists(oldImagePath);
      if (deleted) {
        console.log(`🗑️ Eski resim silindi: ${oldImagePath}`);
      }
    }

    // Yeni imageUrl'i kaydet
    market.imageUrl = imageUrl;
    await marketRepository.save(market);

    res.json({ 
      success: true, 
      message: 'Market image updated successfully',
      imageUrl: market.imageUrl 
    });
  } catch (error) {
    console.error('Error updating market image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Market içeriklerini temizleme endpoint'i
export const clearMarketContents = async (req: Request, res: Response) => {
  try {
    const { marketId } = req.params;
    
    console.log('🗑️ Market içerikleri temizleniyor, Market ID:', marketId);
    
    // Belirli market'in tüm içeriklerini sil
    const deletedCount = await marketContentRepository.delete({
      market: { id: parseInt(marketId) }
    });
    
    console.log(`✅ ${deletedCount.affected} adet market içeriği silindi`);
    
    res.json({
      success: true,
      message: `Market içerikleri başarıyla temizlendi. ${deletedCount.affected} adet içerik silindi.`,
      deletedCount: deletedCount.affected
    });
  } catch (error) {
    console.error('❌ Market içerikleri temizlenirken hata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 