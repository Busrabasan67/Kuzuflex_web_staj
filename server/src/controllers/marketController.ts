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

const marketRepository = AppDataSource.getRepository(Market);
const marketTranslationRepository = AppDataSource.getRepository(MarketTranslation);
const marketContentRepository = AppDataSource.getRepository(MarketContent);
const productGroupRepository = AppDataSource.getRepository(ProductGroup);
const productRepository = AppDataSource.getRepository(Product);

export const getAllMarkets = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.query;
    
    const markets = await marketRepository.find({
      where: { isActive: true },
      relations: ['translations', 'contents'],
      order: { order: 'ASC' }
    });

    const marketsWithTranslations = await Promise.all(markets.map(async (market: Market) => {
      const translation = market.translations.find((t: MarketTranslation) => t.language === language);
      
      const contents = await Promise.all(market.contents.map(async (content: MarketContent) => {
        let name = content.name || '';

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
          level: content.level,
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

    const market = await marketRepository.findOne({
      where: { slug, isActive: true },
      relations: ['translations', 'contents', 'productGroups', 'solutions']
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const translation = market.translations.find((t: MarketTranslation) => t.language === language);
    
    const contents = await Promise.all(market.contents.map(async (content: MarketContent) => {
      let name = content.name || '';

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
        level: content.level,
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

// Market oluşturma sonrası otomatik içerik ekleme
const createDefaultMarketContents = async (marketId: number, hasProducts: boolean, hasSolutions: boolean, hasCertificates: boolean, selectedProductGroups?: number[], selectedProducts?: number[], selectedSolutions?: number[]) => {
  try {
    console.log('🔧 Market için otomatik içerikler oluşturuluyor...');
    
    const contents = [];
    let order = 1;

    // Sertifikalar her zaman eklenir
    if (hasCertificates) {
      contents.push({
        type: 'certificate',
        level: 'main',
        name: 'Certificates',
        targetUrl: '/qm-documents',
        order: order++
      });
    }

    // İletişim her zaman eklenir
    contents.push({
      type: 'contact',
      level: 'main',
      name: 'Contact Us',
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
            level: 'main',
            name: translation.name,
            targetUrl: `/products/${group.slug}`,
            productGroupId: group.id,
            order: order++
          });
        }
      }

      // Alt ürünler varsa ekle
      if (selectedProducts && selectedProducts.length > 0) {
        const products = await productRepository.find({
          where: { id: In(selectedProducts) },
          relations: ['translations']
        });

        for (const product of products) {
          const translation = product.translations?.find(t => t.language === 'en');
          if (translation) {
            contents.push({
              type: 'product',
              level: 'sub',
              name: translation.title,
              targetUrl: `/products/${product.group?.slug}/${product.slug}`,
              productId: product.id,
              order: order++
            });
          }
        }
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
            level: 'main',
            name: translation.title,
            targetUrl: `/solutions/${solution.slug}`,
            order: order++
          });
        }
      }
    }

    // İçerikleri kaydet
    for (const contentData of contents) {
      const content = new MarketContent();
      content.type = contentData.type;
      content.level = contentData.level;
      content.name = contentData.name;
      content.targetUrl = contentData.targetUrl;
      content.productGroupId = contentData.productGroupId;
      content.order = contentData.order;
      content.market = { id: marketId } as Market;

      await marketContentRepository.save(content);
      console.log(`✅ İçerik eklendi: ${contentData.name}`);
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
    const { slug, imageUrl, order, hasProducts, hasSolutions, hasCertificates, translations } = req.body;

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
    res.json(updatedMarket);
  } catch (error) {
    console.error('Error updating market:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const market = await marketRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    await marketRepository.remove(market);
    res.json({ message: 'Market deleted successfully' });
  } catch (error) {
    console.error('Error deleting market:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Market Content CRUD operations
export const createMarketContent = async (req: Request, res: Response) => {
  try {
    const { marketId } = req.params;
    const { type, level, name, targetUrl, productGroupId, productId, order } = req.body;

    const market = await marketRepository.findOne({
      where: { id: parseInt(marketId) }
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const content = new MarketContent();
    content.type = type;
    content.level = level;
    content.name = name;
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
    const { type, level, name, targetUrl, productGroupId, productId, order } = req.body;

    const content = await marketContentRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!content) {
      return res.status(404).json({ error: 'Market content not found' });
    }

    content.type = type || content.type;
    content.level = level || content.level;
    content.name = name || content.name;
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