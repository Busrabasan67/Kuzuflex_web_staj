import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { Market } from "../entity/Market";
import { MarketTranslation } from "../entity/MarketTranslation";
import { MarketContent } from "../entity/MarketContent";
import { ProductGroup } from "../entity/ProductGroup";
import { Product } from "../entity/Product";

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

export const createMarket = async (req: Request, res: Response) => {
  try {
    const { slug, imageUrl, order, hasProducts, hasSolutions, hasCertificates, translations } = req.body;

    const market = new Market();
    market.slug = slug;
    market.imageUrl = imageUrl;
    market.order = order || 0;
    market.hasProducts = hasProducts || false;
    market.hasSolutions = hasSolutions || false;
    market.hasCertificates = hasCertificates || false;

    // Translations
    if (translations && Array.isArray(translations)) {
      market.translations = translations.map((trans: any) => {
        const translation = new MarketTranslation();
        translation.language = trans.language;
        translation.name = trans.name;
        translation.description = trans.description;
        return translation;
      });
    }

    const savedMarket = await marketRepository.save(market);
    res.status(201).json(savedMarket);
  } catch (error) {
    console.error('Error creating market:', error);
    res.status(500).json({ error: 'Internal server error' });
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