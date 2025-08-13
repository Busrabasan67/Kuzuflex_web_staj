import nodemailer from 'nodemailer';
import AppDataSource from '../data-source';
import { EmailSettings } from '../entity/EmailSettings';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  language?: string;
  languageName?: string;
}

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Constructor'da transporter oluşturmayız, dinamik olarak oluşturacağız
  }

  private async getEmailSettings(): Promise<EmailSettings> {
    try {
      const emailSettingsRepository = AppDataSource.getRepository(EmailSettings);
      let settings = await emailSettingsRepository.findOne({ where: { id: 1 } });
      
      if (!settings) {
        // Varsayılan ayarları oluştur
        settings = emailSettingsRepository.create({
          smtpHost: 'smtp.office365.com',
          smtpPort: 587,
          encryption: 'TLS',
          authentication: true,
          smtpUsername: 'wifi@kuzuflex.com',
          smtpPassword: 'Kuzu.328899?!#.',
          contactFormRecipient: 'bilgiislem@kuzuflex.com'
        });
        
        await emailSettingsRepository.save(settings);
      }
      
      return settings;
    } catch (error) {
      console.error('Email ayarları alınamadı:', error);
      throw new Error('Email ayarları alınamadı');
    }
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    const settings = await this.getEmailSettings();
    
    return nodemailer.createTransport({
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
  }

  async sendContactFormEmail(formData: ContactFormData): Promise<boolean> {
    try {
      const settings = await this.getEmailSettings();
      const transporter = await this.createTransporter();
      
      const mailOptions = {
        from: `"Kuzuflex Contact System" <${settings.smtpUsername}>`,
        to: settings.contactFormRecipient,
        replyTo: formData.email, // Formu dolduran kişinin email'i reply-to olarak eklensin
        subject: `Yeni İletişim Formu: ${formData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px;">📧 Yeni İletişim Formu Mesajı</h2>
              
              <p style="margin-bottom: 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bu mail kuzuflex.com web sitesi üzerindeki <strong>${formData.languageName ? formData.languageName : 'Türkçe'} form</strong> üzerinden <strong>${formData.name} (${formData.email})</strong> tarafından gönderilmiştir. Gönderen kişiye ait bilgiler aşağıda listelenmiştir:
              </p>
              
              <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #e5e7eb; margin: 0 10px;">
                <div style="margin-bottom: 20px;">
                  <strong style="color: #1e40af; font-size: 18px;">AD SOYAD:</strong>
                  <p style="margin: 8px 0 0 0; color: #374151; font-size: 17px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">${formData.name}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <strong style="color: #1e40af; font-size: 18px;">E POSTA:</strong>
                  <p style="margin: 8px 0 0 0; color: #374151; font-size: 17px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">${formData.email}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <strong style="color: #1e40af; font-size: 18px;">TELEFON:</strong>
                  <p style="margin: 8px 0 0 0; color: #374151; font-size: 17px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">${formData.subject}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <strong style="color: #1e40af; font-size: 18px;">MESAJ:</strong>
                  <p style="margin: 8px 0 0 0; color: #374151; font-size: 17px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1e40af; line-height: 1.6;">${formData.message}</p>
                </div>
              </div>
            </div>
            
            <hr style="border: none; border-top: 2px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
              <p style="margin-bottom: 15px;">
                Bu e posta, Kuzuflex web sitesi üzerinden otomatik olarak iletilmiştir.
              </p>
            </div>
            
            <div style="font-family: Arial, sans-serif; font-size: 12pt; color: #000; background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: left; margin-top: 20px;">
              <div style="margin-bottom: 15px;">
                <strong style="color: #1e40af; font-size: 14pt;">KUZUFLEX METAL SANAYİ VE TİCARET A.Ş.</strong>
              </div>
              <div style="margin-bottom: 5px;">
                Ata, Serbest Bölge Gelincik Cadde No:1
              </div>
              <div style="margin-bottom: 5px;">
                16600 Gemlik/Bursa/TÜRKİYE
              </div>
              <div style="margin-bottom: 5px;">
                Telefon: +90 0850 800 2222
              </div>
              <div style="margin-bottom: 5px;">
                <a href="mailto:info@kuzuflex.com" style="color: #1e40af; text-decoration: none;">info@kuzuflex.com</a>
              </div>
              <div style="margin-bottom: 5px;">
                <a href="https://www.kuzuflex.com" style="color: #1e40af; text-decoration: none;">www.kuzuflex.com</a>
              </div>
            </div>
          </div>
        `,
        text: `Yeni İletişim Formu Mesajı

Bu mail kuzuflex.com web sitesi üzerindeki ${formData.languageName ? formData.languageName : 'Türkçe'} form üzerinden ${formData.name} (${formData.email}) tarafından gönderilmiştir. Gönderen kişiye ait bilgiler aşağıda listelenmiştir:

AD SOYAD: ${formData.name}
E POSTA: ${formData.email}
TELEFON: ${formData.subject}
MESAJ: ${formData.message}

Bu e posta, Kuzuflex web sitesi üzerinden otomatik olarak iletilmiştir.

KUZUFLEX METAL SANAYİ VE TİCARET A.Ş.
Ata, Serbest Bölge Gelincik Cadde No:1
16600 Gemlik/Bursa/TÜRKİYE
Telefon: +90 0850 800 2222
info@kuzuflex.com
www.kuzuflex.com`
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Mail gönderme hatası:', error);
      return false;
    }
  }

  async sendDirectEmail(to: string, subject: string, message: string): Promise<boolean> {
    try {
      const settings = await this.getEmailSettings();
      const transporter = await this.createTransporter();
      
      const mailOptions = {
        from: `"Kuzuflex Contact System" <${settings.smtpUsername}>`,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px;">📧 ${subject}</h2>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af;">
                ${message}
              </div>
            </div>
            
            <hr style="border: none; border-top: 2px solid #e9ecef; margin: 30px 0;">
            
            <div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: left;">
              <div style="margin-bottom: 15px;">
                <strong style="color: #1e40af; font-size: 12pt;">KUZUFLEX METAL SANAYİ VE TİCARET A.Ş.</strong>
              </div>
              <div style="margin-bottom: 5px;">
                Ata, Serbest Bölge Gelincik Cadde No:1
              </div>
              <div style="margin-bottom: 5px;">
                16600 Gemlik/Bursa/TÜRKİYE
              </div>
              <div style="margin-bottom: 5px;">
                Telefon: +90 0850 800 2222
              </div>
              <div style="margin-bottom: 5px;">
                <a href="mailto:info@kuzuflex.com" style="color: #1e40af; text-decoration: none;">info@kuzuflex.com</a>
              </div>
              <div style="margin-bottom: 5px;">
                <a href="https://www.kuzuflex.com" style="color: #1e40af; text-decoration: none;">www.kuzuflex.com</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 11pt;">
              <small>Bu mesaj kuzuflex.com web sitesinden gönderilmiştir.</small>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Mail gönderme hatası:', error);
      return false;
    }
  }

  // Test connection
  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('Mail bağlantı hatası:', error);
      return false;
    }
  }
}

export default new MailService();
