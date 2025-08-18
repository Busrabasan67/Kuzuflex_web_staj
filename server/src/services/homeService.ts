import AppDataSource from '../data-source';
import { Market } from '../entity/Market';
import { Solution } from '../entity/Solution';
import { ProductGroup } from '../entity/ProductGroup';
import { Product } from '../entity/Product';

export class HomeService {
  // Markets verilerini çek ve formatla
  async getMarketsData(language: string) {
    try {
      const marketsRepository = AppDataSource.getRepository(Market);
      const markets = await marketsRepository.find({
        relations: ['translations']
      });

      console.log('Markets fetched:', markets.length);

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

      return formattedMarkets;
    } catch (error) {
      console.error('Error fetching markets data:', error);
      throw new Error('Markets verileri alınamadı');
    }
  }

  // Solutions verilerini çek ve formatla
  async getSolutionsData(language: string) {
    try {
      const solutionsRepository = AppDataSource.getRepository(Solution);
      const solutions = await solutionsRepository.find({
        relations: ['translations']
      });

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

      return formattedSolutions;
    } catch (error) {
      console.error('Error fetching solutions data:', error);
      throw new Error('Solutions verileri alınamadı');
    }
  }

  // Product Groups verilerini çek ve formatla
  async getProductGroupsData(language: string) {
    try {
      const productGroupsRepository = AppDataSource.getRepository(ProductGroup);
      const productGroups = await productGroupsRepository.find({
        relations: ['translations']
      });
      
      console.log('Product Groups fetched:', productGroups.length);

      // Products verilerini de çek (grup ürünleri için)
      const productsRepository = AppDataSource.getRepository(Product);
      const products = await productsRepository.find({
        relations: ['translations', 'group', 'group.translations'],
        order: { id: 'ASC' }
      });

      const formattedProductGroups = productGroups.map(group => {
        const translation = group.translations?.find(t => t.language === language);
        console.log(`Formatting group: ${group.slug}, translation:`, translation);
        
        // Bu gruba ait ürünleri bul
        const groupProducts = products.filter(product => product.group?.id === group.id);
        console.log(`  Group ${group.slug} has ${groupProducts.length} products`);
        
        const formattedGroup = {
          id: group.id,
          slug: group.slug,
          title: translation?.name || group.slug,
          description: translation?.description || 'Product group description',
          imageUrl: group.imageUrl,
          order: group.id,
          // Alt ürünleri (subcategories) ekle - doğru ilişki ile
          subcategories: groupProducts.map(product => {
            const productTranslation = product.translations?.find(t => t.language === language);
            console.log(`    Product: ${product.slug}, translation:`, productTranslation);
            
            return {
              id: product.id,
              slug: product.slug,
              title: productTranslation?.title || product.slug,
              description: productTranslation?.description || 'Product description',
              imageUrl: product.imageUrl
            };
          })
        };
        
        console.log(`Formatted group: ${formattedGroup.title}, subcategories: ${formattedGroup.subcategories.length}`);
        return formattedGroup;
      });

      return formattedProductGroups;
    } catch (error) {
      console.error('Error fetching product groups data:', error);
      throw new Error('Product groups verileri alınamadı');
    }
  }

  // Featured Products verilerini çek ve formatla
  async getFeaturedProductsData(language: string) {
    try {
      const productsRepository = AppDataSource.getRepository(Product);
      const products = await productsRepository.find({
        relations: ['translations', 'group', 'group.translations'],
        order: { id: 'ASC' }
      });

      console.log('Products fetched:', products.length);

      const formattedProducts = products.slice(0, 6).map(product => {
        const translation = product.translations?.find(t => t.language === language);
        const groupTranslation = product.group?.translations?.find(t => t.language === language);
        
        return {
          id: product.id,
          slug: product.slug,
          title: translation?.title || product.slug,
          description: translation?.description || 'Product description',
          imageUrl: product.imageUrl,
          productGroup: {
            id: product.group?.id || 0,
            slug: product.group?.slug || 'default-group',
            title: groupTranslation?.name || product.group?.slug || 'Default Group'
          },
          order: product.id
        };
      });

      return formattedProducts;
    } catch (error) {
      console.error('Error fetching featured products data:', error);
      throw new Error('Featured products verileri alınamadı');
    }
  }

  // Ana sayfa için tüm verileri getir
  async getHomeData(language: string) {
    try {
      console.log('Home data fetch started');
      console.log('Language:', language);

      // Tüm verileri paralel olarak çek
      const [markets, solutions, productGroups, featuredProducts] = await Promise.all([
        this.getMarketsData(language),
        this.getSolutionsData(language),
        this.getProductGroupsData(language),
        this.getFeaturedProductsData(language)
      ]);

      const responseData = {
        markets,
        solutions,
        productGroups,
        featuredProducts
      };

      console.log('Sending formatted data with translations');
      return responseData;

    } catch (error) {
      console.error('Home data fetch error:', error);
      throw new Error('Ana sayfa verileri yüklenemedi');
    }
  }
}

export default new HomeService();
