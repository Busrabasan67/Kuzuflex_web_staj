// server/src/controllers/homeController.ts
import { Request, Response } from 'express';
import AppDataSource from '../data-source';
import { Market } from '../entity/Market';
import { Solution } from '../entity/Solution';
import { ProductGroup } from '../entity/ProductGroup';
import { Product } from '../entity/Product';

export const getHomeData = async (req: Request, res: Response) => {
  try {
    console.log('Home data fetch started');
    
    // Dil parametresini al
    const language = req.query.lang || 'tr';
    console.log('Language:', language);
    
    // Markets verilerini çek - translation'lar ile
    const marketsRepository = AppDataSource.getRepository(Market);
    const markets = await marketsRepository.find({
      relations: ['translations']
    });
    console.log('Markets fetched:', markets.length);

    // Solutions verilerini çek - translation'lar ile
    const solutionsRepository = AppDataSource.getRepository(Solution);
    const solutions = await solutionsRepository.find({
      relations: ['translations']
    });

    // Product Groups verilerini çek - translation'lar ile
    const productGroupsRepository = AppDataSource.getRepository(ProductGroup);
    const productGroups = await productGroupsRepository.find({
      relations: ['translations']
    });

    // Products verilerini çek
    const productsRepository = AppDataSource.getRepository(Product);
    const products = await productsRepository.find({
      take: 6
    });

    // Markets verilerini formatla - translation'lı
    const formattedMarkets = markets.map(market => {
      const translation = market.translations?.find(t => t.language === language);
      return {
        id: market.id,
        slug: market.slug,
        title: translation?.name || market.slug,
        description: translation?.description || 'Market description',
        imageUrl: market.imageUrl,
        order: market.id
      };
    });

    // Solutions verilerini formatla - translation'lı
    const formattedSolutions = solutions.map(solution => {
      const translation = solution.translations?.find(t => t.language === language);
      return {
        id: solution.id,
        slug: solution.slug,
        title: translation?.title || solution.slug,
        description: translation?.description || 'Solution description',
        imageUrl: solution.imageUrl,
        order: solution.id
      };
    });

    // Product Groups verilerini formatla - translation'lı
    const formattedProductGroups = productGroups.map(group => {
      const translation = group.translations?.find(t => t.language === language);
      return {
        id: group.id,
        slug: group.slug,
        title: translation?.name || group.slug,
        description: translation?.description || 'Product group description',
        imageUrl: group.imageUrl,
        order: group.id
      };
    });

    // Products verilerini formatla
    const formattedProducts = products.map(product => ({
      id: product.id,
      slug: product.slug,
      title: product.slug || `Product ${product.id}`,
      description: 'Product description',
      imageUrl: product.imageUrl,
      productGroup: {
        id: 1,
        slug: 'default-group',
        title: 'Default Group'
      },
      order: product.id
    }));

    const responseData = {
      markets: formattedMarkets,
      solutions: formattedSolutions,
      productGroups: formattedProductGroups,
      featuredProducts: formattedProducts
    };

    console.log('Sending formatted data with translations');
    res.json(responseData);

  } catch (error) {
    console.error('Home data fetch error:', error);
    res.status(500).json({ 
      message: 'Ana sayfa verileri yüklenemedi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
