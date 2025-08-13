import  AppDataSource  from '../data-source';
import { EmailSettings } from '../entity/EmailSettings';

async function seedEmailSettings() {
  try {
    // DataSource'u başlat
    await AppDataSource.initialize();
    console.log('Data Source başlatıldı');

    const emailSettingsRepository = AppDataSource.getRepository(EmailSettings);

    // Mevcut ayarları kontrol et
    let existingSettings = await emailSettingsRepository.findOne({ where: { id: 1 } });

    if (existingSettings) {
      console.log('Email ayarları zaten mevcut, güncelleniyor...');
      
      // Mevcut ayarları güncelle
      existingSettings.smtpHost = 'smtp.office365.com';
      existingSettings.smtpPort = 587;
      existingSettings.encryption = 'TLS';
      existingSettings.authentication = true;
      existingSettings.smtpUsername = 'wifi@kuzuflex.com';
      existingSettings.smtpPassword = 'Kuzu.328899?!#.';
      existingSettings.contactFormRecipient = 'bilgiislem@kuzuflex.com';
      

      await emailSettingsRepository.save(existingSettings);
      console.log('Email ayarları güncellendi');
    } else {
      console.log('Yeni email ayarları oluşturuluyor...');
      
      // Yeni ayarları oluştur
      const newSettings = emailSettingsRepository.create({
        smtpHost: 'smtp.office365.com',
        smtpPort: 587,
        encryption: 'TLS',
        authentication: true,
        smtpUsername: 'wifi@kuzuflex.com',
        smtpPassword: 'Kuzu.328899?!#.',
        contactFormRecipient: 'bilgiislem@kuzuflex.com'
        
      });

      await emailSettingsRepository.save(newSettings);
      console.log('Email ayarları oluşturuldu');
    }

    console.log('✅ Email ayarları başarıyla seed edildi!');
    
    // Mevcut ayarları göster
    const finalSettings = await emailSettingsRepository.findOne({ where: { id: 1 } });
    console.log('📧 Mevcut Email Ayarları:');
    console.log('SMTP Host:', finalSettings?.smtpHost);
    console.log('SMTP Port:', finalSettings?.smtpPort);
    console.log('Encryption:', finalSettings?.encryption);
    console.log('Authentication:', finalSettings?.authentication);
    console.log('SMTP Username:', finalSettings?.smtpUsername);
    console.log('Contact Form Recipient:', finalSettings?.contactFormRecipient);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    // DataSource'u kapat
    await AppDataSource.destroy();
    console.log('Data Source kapatıldı');
    process.exit(0);
  }
}

// Script'i çalıştır
seedEmailSettings();
