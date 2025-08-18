import AppDataSource from '../data-source';
import { AboutPageExtraContent } from '../entity/AboutPageExtraContent';
import { AboutPage } from '../entity/AboutPage';

export class AboutPageExtraContentService {
  private extraContentRepository = AppDataSource.getRepository(AboutPageExtraContent);
  private aboutPageRepository = AppDataSource.getRepository(AboutPage);

  // Çoklu dil için ekstra içerik ekle
  async createMultiLanguageExtraContent(contentData: {
    type: string;
    contents: any[];
    order?: number;
  }) {
    try {
      const { type, contents, order } = contentData;

      console.log('createMultiLanguageExtraContent çağrıldı:', { type, contents, order });

      // Hakkımızda sayfasını bul
      const aboutPage = await this.aboutPageRepository.findOne({
        where: { slug: 'about-us' }
      });

      if (!aboutPage) {
        throw new Error('Hakkımızda sayfası bulunamadı');
      }

      console.log('About page bulundu:', aboutPage.id);

      // Eğer order belirtilmemişse, mevcut en yüksek order'ı bul ve +1 ekle
      let finalOrder = order;
      if (!finalOrder) {
        const maxOrderContent = await this.extraContentRepository.findOne({
          where: { page: { id: aboutPage.id } },
          order: { order: 'DESC' }
        });
        finalOrder = maxOrderContent ? maxOrderContent.order + 1 : 1;
        console.log('Order belirtilmemiş, hesaplanan order:', finalOrder);
      } else {
        console.log('Order belirtilmiş:', finalOrder);
      }

      // Mevcut içerikleri kontrol et
      const existingContents = await this.extraContentRepository.find({
        where: { page: { id: aboutPage.id } },
        order: { order: 'ASC' }
      });
      console.log('Mevcut içerikler:', existingContents.map(c => ({ id: c.id, order: c.order, language: c.language })));

      // Her dil için içerik oluştur
      const savedContents = [];
      for (const content of contents) {
        const extraContent = this.extraContentRepository.create({
          language: content.language,
          title: content.title,
          content: content.content,
          type,
          order: finalOrder,
          page: aboutPage
        });

        const savedContent = await this.extraContentRepository.save(extraContent);
        savedContents.push(savedContent);
        console.log(`Yeni içerik oluşturuldu: ID ${savedContent.id}, Order ${savedContent.order}, Dil ${savedContent.language}`);
      }

      // Son durumu kontrol et
      const finalContents = await this.extraContentRepository.find({
        where: { page: { id: aboutPage.id } },
        order: { order: 'ASC' }
      });
      console.log('Son durum - toplam içerik sayısı:', finalContents.length);
      console.log('Son durum - içerikler:', finalContents.map(c => ({ id: c.id, order: c.order, language: c.language })));

      return {
        message: 'Tüm diller için içerik başarıyla eklendi',
        contents: savedContents
      };
    } catch (error) {
      console.error('Error creating multi-language extra content:', error);
      throw error;
    }
  }

  // Tek ekstra içerik ekle
  async createExtraContent(contentData: {
    language: string;
    title: string;
    content: string;
    type: string;
    order?: number;
  }) {
    try {
      const { language, title, content, type, order } = contentData;

      // Hakkımızda sayfasını bul
      const aboutPage = await this.aboutPageRepository.findOne({
        where: { slug: 'about-us' }
      });

      if (!aboutPage) {
        throw new Error('Hakkımızda sayfası bulunamadı');
      }

      const extraContent = this.extraContentRepository.create({
        language,
        title,
        content,
        type,
        order: order || 1,
        page: aboutPage
      });

      const savedContent = await this.extraContentRepository.save(extraContent);
      return savedContent;
    } catch (error) {
      console.error('Error creating extra content:', error);
      throw error;
    }
  }

  // Ekstra içerik getir
  async getExtraContent(id: number) {
    try {
      const extraContent = await this.extraContentRepository.findOne({
        where: { id },
        relations: ['page']
      });

      if (!extraContent) {
        throw new Error('İçerik bulunamadı');
      }

      return extraContent;
    } catch (error) {
      console.error('Error fetching extra content:', error);
      throw error;
    }
  }

  // Tüm ekstra içerikleri getir
  async getAllExtraContents() {
    try {
      const extraContents = await this.extraContentRepository.find({
        relations: ['page'],
        order: {
          order: 'ASC',
          createdAt: 'DESC'
        }
      });

      return extraContents;
    } catch (error) {
      console.error('Error fetching all extra contents:', error);
      throw error;
    }
  }

  // Ekstra içerik güncelle
  async updateExtraContent(id: number, updateData: {
    language?: string;
    title?: string;
    content?: string;
    type?: string;
    order?: number;
  }) {
    try {
      const { language, title, content, type, order } = updateData;

      const extraContent = await this.extraContentRepository.findOne({
        where: { id }
      });

      if (!extraContent) {
        throw new Error('İçerik bulunamadı');
      }

      // İçeriği güncelle
      extraContent.language = language || extraContent.language;
      extraContent.title = title || extraContent.title;
      extraContent.content = content || extraContent.content;
      extraContent.type = type || extraContent.type;
      extraContent.order = order || extraContent.order;

      const updatedContent = await this.extraContentRepository.save(extraContent);
      return updatedContent;
    } catch (error) {
      console.error('Error updating extra content:', error);
      throw error;
    }
  }

  // Grup güncelleme (tüm diller için)
  async updateGroupExtraContent(groupData: {
    groupId?: string;
    type: string;
    contents: any[];
    order: number;
    existingIds?: number[];
  }) {
    try {
      const { groupId, type, contents, order, existingIds } = groupData;

      console.log('Grup güncelleme isteği:', { groupId, type, contents, order, existingIds });

      // Hakkımızda sayfasını bul
      const aboutPage = await this.aboutPageRepository.findOne({
        where: { slug: 'about-us' }
      });

      if (!aboutPage) {
        throw new Error('Hakkımızda sayfası bulunamadı');
      }

      // Mevcut grup içeriklerini bul (order'a göre)
      const existingContents = await this.extraContentRepository.find({
        where: { page: { id: aboutPage.id }, order: order }
      });

      console.log('Mevcut içerikler bulundu:', existingContents.length);

      const updatedContents = [];

      // Her dil için mevcut içeriği güncelle veya yeni oluştur
      for (const content of contents) {
        const existingContent = existingContents.find(ec => ec.language === content.language);
        
        if (existingContent) {
          // Mevcut içeriği güncelle - ID korunur
          existingContent.title = content.title;
          existingContent.content = content.content;
          existingContent.type = type;
          
          const updatedContent = await this.extraContentRepository.save(existingContent);
          updatedContents.push(updatedContent);
          console.log(`İçerik güncellendi: ID ${existingContent.id}, Dil: ${content.language}`);
        } else {
          // Yeni dil için içerik oluştur
          const newContent = this.extraContentRepository.create({
            language: content.language,
            title: content.title,
            content: content.content,
            type,
            order: order,
            page: aboutPage
          });

          const savedContent = await this.extraContentRepository.save(newContent);
          updatedContents.push(savedContent);
          console.log(`Yeni içerik eklendi: ID ${savedContent.id}, Dil: ${content.language}`);
        }
      }

      console.log('Güncelleme tamamlandı. Toplam içerik:', updatedContents.length);
      console.log('Güncellenen ID\'ler:', updatedContents.map(c => c.id));

      return {
        message: 'Grup içerikleri başarıyla güncellendi',
        contents: updatedContents
      };
    } catch (error) {
      console.error('Error updating group extra content:', error);
      throw error;
    }
  }

  // Ekstra içerik sil
  async deleteExtraContent(id: number) {
    try {
      const extraContent = await this.extraContentRepository.findOne({
        where: { id }
      });

      if (!extraContent) {
        throw new Error('İçerik bulunamadı');
      }

      await this.extraContentRepository.remove(extraContent);
      return { message: 'İçerik başarıyla silindi' };
    } catch (error) {
      console.error('Error deleting extra content:', error);
      throw error;
    }
  }

  // Dil bazında ekstra içerikleri getir
  async getExtraContentsByLanguage(language: string) {
    try {
      const extraContents = await this.extraContentRepository.find({
        where: { language },
        relations: ['page'],
        order: {
          order: 'ASC'
        }
      });

      return extraContents;
    } catch (error) {
      console.error('Error fetching extra contents by language:', error);
      throw error;
    }
  }
}

export default new AboutPageExtraContentService();
