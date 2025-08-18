import AppDataSource from '../data-source';
import { AboutPage } from '../entity/AboutPage';
import { AboutPageTranslation } from '../entity/AboutPageTranslation';
import { AboutPageExtraContent } from '../entity/AboutPageExtraContent';

export class AboutPageService {
  private aboutPageRepository = AppDataSource.getRepository(AboutPage);
  private translationRepository = AppDataSource.getRepository(AboutPageTranslation);
  private extraContentRepository = AppDataSource.getRepository(AboutPageExtraContent);

  // Hakkımızda sayfasını getir
  async getAboutPage(language?: string) {
    try {
      const aboutPage = await this.aboutPageRepository.findOne({
        where: { slug: 'about-us' },
        relations: ['translations', 'extraContents'],
        order: {
          extraContents: {
            order: 'ASC'
          }
        }
      });

      if (!aboutPage) {
        throw new Error('Hakkımızda sayfası bulunamadı');
      }

      // Eğer dil belirtilmişse, sadece o dildeki verileri döndür
      if (language) {
        return {
          ...aboutPage,
                  translations: aboutPage.translations.filter(t => t.language === language),
          extraContents: aboutPage.extraContents.filter(c => c.language === language)
        };
      }

      return aboutPage;
    } catch (error) {
      console.error('Error fetching about page:', error);
      throw error;
    }
  }

  // Hakkımızda sayfası oluştur
  async createAboutPage(pageData: {
    slug: string;
    heroImageUrl?: string;
    translations?: any[];
  }) {
    try {
      const { slug, heroImageUrl, translations } = pageData;

      // Mevcut sayfa var mı kontrol et
      const existingPage = await this.aboutPageRepository.findOne({
        where: { slug }
      });

      if (existingPage) {
        throw new Error('Bu slug ile sayfa zaten mevcut');
      }

      // Yeni sayfa oluştur
      const aboutPage = this.aboutPageRepository.create({
        slug,
        heroImageUrl: heroImageUrl || '',
        translations: translations || []
      });

      const savedPage = await this.aboutPageRepository.save(aboutPage);

              // Çevirileri kaydet
        if (translations && translations.length > 0) {
          for (const translation of translations) {
            const translationEntity = this.translationRepository.create({
              title: translation.title,
              language: translation.language,
              page: savedPage
            });
            await this.translationRepository.save(translationEntity);
          }
        }

      // Güncellenmiş sayfayı getir
      const updatedPage = await this.aboutPageRepository.findOne({
        where: { id: savedPage.id },
        relations: ['translations', 'extraContents']
      });

      return updatedPage;
    } catch (error) {
      console.error('Error creating about page:', error);
      throw error;
    }
  }

  // Hakkımızda sayfasını güncelle
  async updateAboutPage(id: number, updateData: {
    heroImageUrl?: string;
    translations?: any[];
  }) {
    try {
      const { heroImageUrl, translations } = updateData;

      const aboutPage = await this.aboutPageRepository.findOne({
        where: { id },
        relations: ['translations']
      });

      if (!aboutPage) {
        throw new Error('Hakkımızda sayfası bulunamadı');
      }

      // Ana sayfa bilgilerini güncelle
      aboutPage.heroImageUrl = heroImageUrl || aboutPage.heroImageUrl;
      await this.aboutPageRepository.save(aboutPage);

      // Çevirileri güncelle
      if (translations && translations.length > 0) {
        // Mevcut çevirileri sil
        await this.translationRepository.delete({ page: { id: aboutPage.id } });

        // Yeni çevirileri ekle
        for (const translation of translations) {
          const translationEntity = this.translationRepository.create({
            title: translation.title,
            language: translation.language,
            page: aboutPage
          });
          await this.translationRepository.save(translationEntity);
        }
      }

      // Güncellenmiş sayfayı getir
      const updatedPage = await this.aboutPageRepository.findOne({
        where: { id: aboutPage.id },
        relations: ['translations', 'extraContents']
      });

      return updatedPage;
    } catch (error) {
      console.error('Error updating about page:', error);
      throw error;
    }
  }

  // Hakkımızda sayfasını sil
  async deleteAboutPage(id: number) {
    try {
      const aboutPage = await this.aboutPageRepository.findOne({
        where: { id }
      });

      if (!aboutPage) {
        throw new Error('Hakkımızda sayfası bulunamadı');
      }

      await this.aboutPageRepository.remove(aboutPage);
      return { message: 'Hakkımızda sayfası başarıyla silindi' };
    } catch (error) {
      console.error('Error deleting about page:', error);
      throw error;
    }
  }

  // Tüm hakkımızda sayfalarını getir (admin için)
  async getAllAboutPages() {
    try {
      const aboutPages = await this.aboutPageRepository.find({
        relations: ['translations', 'extraContents'],
        order: {
          extraContents: {
            order: 'ASC'
          }
        }
      });

      

      return aboutPages;
    } catch (error) {
      console.error('Error fetching all about pages:', error);
      throw error;
    }
  }
}

export default new AboutPageService();
