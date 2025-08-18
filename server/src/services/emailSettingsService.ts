import AppDataSource from '../data-source';
import { EmailSettings } from '../entity/EmailSettings';
import * as nodemailer from 'nodemailer';

export class EmailSettingsService {
  private emailSettingsRepository = AppDataSource.getRepository(EmailSettings);

  // Email ayarlarını getir (varsayılan ayarları oluştur gerekirse)
  async getEmailSettings() {
    try {
      const settings = await this.emailSettingsRepository.findOne({ where: { id: 1 } });
      
      if (!settings) {
        // Varsayılan ayarları oluştur
        const defaultSettings = this.emailSettingsRepository.create({
          smtpHost: 'smtp.office365.com',
          smtpPort: 587,
          encryption: 'TLS',
          authentication: true,
          smtpUsername: 'wifi@kuzuflex.com',
          contactFormRecipient: 'bilgiislem@kuzuflex.com'
        });
        
        const savedSettings = await this.emailSettingsRepository.save(defaultSettings);
        return savedSettings;
      }
      
      return settings;
    } catch (error) {
      console.error('Email settings getirme hatası:', error);
      throw new Error('Email ayarları alınamadı');
    }
  }

  // Email ayarlarını güncelle
  async updateEmailSettings(updateData: {
    smtpHost: string;
    smtpPort: number;
    encryption: string;
    authentication: boolean;
    smtpUsername: string;
    smtpPassword?: string;
    contactFormRecipient: string;
    germanyEmail?: string;
    mailFrom?: string;
  }) {
    try {
      const {
        smtpHost,
        smtpPort,
        encryption,
        authentication,
        smtpUsername,
        smtpPassword,
        contactFormRecipient
      } = updateData;

      let settings = await this.emailSettingsRepository.findOne({ where: { id: 1 } });
      
      if (!settings) {
        settings = this.emailSettingsRepository.create({
          smtpHost,
          smtpPort,
          encryption,
          authentication,
          smtpUsername,
          smtpPassword,
          contactFormRecipient
        });
      } else {
        // Sadece şifre değiştiyse güncelle
        if (smtpPassword !== undefined) {
          settings.smtpPassword = smtpPassword;
        }
        
        settings.smtpHost = smtpHost;
        settings.smtpPort = smtpPort;
        settings.encryption = encryption;
        settings.authentication = authentication;
        settings.smtpUsername = smtpUsername;
        settings.contactFormRecipient = contactFormRecipient;
      }

      const savedSettings = await this.emailSettingsRepository.save(settings);
      return savedSettings;
    } catch (error) {
      console.error('Email settings güncelleme hatası:', error);
      throw new Error('Email ayarları güncellenemedi');
    }
  }

  // Email bağlantısını test et
  async testEmailConnection() {
    try {
      const settings = await this.emailSettingsRepository.findOne({ where: { id: 1 } });
      
      if (!settings) {
        throw new Error('Email ayarları bulunamadı');
      }

      // Test email gönder
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.encryption === 'SSL',
        auth: {
          user: settings.smtpUsername,
          pass: settings.smtpPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Test email gönder
      const info = await transporter.sendMail({
        from: `"KUZUFLEX Test" <${settings.smtpUsername}>`,
        to: settings.contactFormRecipient,
        subject: 'Email Ayarları Test',
        text: 'Bu bir test emailidir. Email ayarlarınız başarıyla çalışıyor.',
        html: '<p>Bu bir test emailidir. Email ayarlarınız başarıyla çalışıyor.</p>'
      });

      return {
        success: true,
        message: 'Test email başarıyla gönderildi',
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Test email hatası:', error);
      throw new Error('Test email gönderilemedi: ' + (error as Error).message);
    }
  }
}

export default new EmailSettingsService();
