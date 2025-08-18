"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const data_source_1 = __importDefault(require("../data-source"));
const EmailSettings_1 = require("../entity/EmailSettings");
class MailService {
    constructor() {
        this.transporter = null;
        // Constructor'da transporter oluşturmayız, dinamik olarak oluşturacağız
    }
    async getEmailSettings() {
        try {
            const emailSettingsRepository = data_source_1.default.getRepository(EmailSettings_1.EmailSettings);
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
        }
        catch (error) {
            console.error('Email ayarları alınamadı:', error);
            throw new Error('Email ayarları alınamadı');
        }
    }
    async createTransporter() {
        const settings = await this.getEmailSettings();
        return nodemailer_1.default.createTransport({
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
    async sendContactFormEmail(formData) {
        try {
            const settings = await this.getEmailSettings();
            const transporter = await this.createTransporter();
            const mailOptions = {
                from: `"Kuzuflex Contact System" <${settings.smtpUsername}>`,
                to: settings.contactFormRecipient,
                replyTo: formData.email, // Formu dolduran kişinin email'i reply-to olarak eklensin
                subject: `Yeni İletişim Formu: ${formData.name}`,
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
                  <p style="margin: 8px 0 0 0; color: #374151; font-size: 17px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">${formData.phone}</p>
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
TELEFON: ${formData.phone}
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
        }
        catch (error) {
            console.error('Mail gönderme hatası:', error);
            return false;
        }
    }
    async sendDirectEmail(to, subject, message) {
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
        }
        catch (error) {
            console.error('Mail gönderme hatası:', error);
            return false;
        }
    }
    async sendPasswordResetEmail(email, resetToken) {
        try {
            const settings = await this.getEmailSettings();
            const transporter = await this.createTransporter();
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-reset-password?token=${resetToken}`;
            const mailOptions = {
                from: `"Kuzuflex Admin Panel" <${settings.smtpUsername}>`,
                to: email,
                subject: 'Kuzuflex Admin Panel - Şifre Sıfırlama',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #e5e7eb;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e40af; margin: 0; font-size: 28px;">🔐 Şifre Sıfırlama</h1>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Kuzuflex Admin Panel</p>
              </div>
              
              <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; border-left: 4px solid #1e40af; margin-bottom: 25px;">
                <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Merhaba,
                </p>
                <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Kuzuflex Admin Panel hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                  🔑 Şifremi Sıfırla
                </a>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Güvenlik Uyarısı:</strong> Bu link 15 dakika süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
                </p>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:
                </p>
                <p style="margin: 10px 0 0 0; color: #1e40af; font-size: 12px; word-break: break-all;">
                  ${resetUrl}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #6b7280; background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #1e40af;">KUZUFLEX METAL SANAYİ VE TİCARET A.Ş.</strong>
                </div>
                <div style="font-size: 10pt;">
                  Ata, Serbest Bölge Gelincik Cadde No:1<br>
                  16600 Gemlik/Bursa/TÜRKİYE<br>
                  <a href="https://www.kuzuflex.com" style="color: #1e40af; text-decoration: none;">www.kuzuflex.com</a>
                </div>
              </div>
            </div>
          </div>
        `,
                text: `Kuzuflex Admin Panel - Şifre Sıfırlama

Merhaba,

Kuzuflex Admin Panel hesabınız için şifre sıfırlama talebinde bulundunuz. 

Şifrenizi sıfırlamak için aşağıdaki linki kullanın:
${resetUrl}

⚠️ Güvenlik Uyarısı: Bu link 15 dakika süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.

KUZUFLEX METAL SANAYİ VE TİCARET A.Ş.
Ata, Serbest Bölge Gelincik Cadde No:1
16600 Gemlik/Bursa/TÜRKİYE
www.kuzuflex.com`
            };
            await transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            console.error('Şifre sıfırlama mail gönderme hatası:', error);
            return false;
        }
    }
    // Test connection
    async verifyConnection() {
        try {
            const transporter = await this.createTransporter();
            await transporter.verify();
            return true;
        }
        catch (error) {
            console.error('Mail bağlantı hatası:', error);
            return false;
        }
    }
}
exports.default = new MailService();
