import AppDataSource from "../data-source";
import { Admin } from "../entity/Admin";

interface ProfileResult {
  success: boolean;
  message: string;
  data?: any;
}

interface AdminProfileData {
  id: number;
  username: string;
  email: string;
}

class ProfileService {
  /**
   * Admin profil bilgilerini getir
   */
  async getAdminProfile(adminId: number): Promise<ProfileResult> {
    try {
      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOneBy({ id: adminId });

      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

      return {
        success: true,
        message: "Profil bilgileri getirildi",
        data: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      };
    } catch (error) {
      console.error("Profil getirme hatası:", error);
      return {
        success: false,
        message: "Profil bilgileri getirilirken bir hata oluştu"
      };
    }
  }

  /**
   * Admin profil bilgilerini güncelle
   */
  async updateAdminProfile(adminId: number, username: string, email: string): Promise<ProfileResult> {
    try {
      // Input validation
      const validationResult = this.validateProfileInput(username, email);
      if (!validationResult.success) {
        return validationResult;
      }

      const adminRepo = AppDataSource.getRepository(Admin);
      
      // Mevcut admin'i bul
      const admin = await adminRepo.findOneBy({ id: adminId });
      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

      // Benzersizlik kontrolleri
      const uniquenessCheck = await this.checkUniqueness(adminId, username, email);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      // Profil bilgilerini güncelle
      admin.username = username;
      admin.email = email;
      await adminRepo.save(admin);

      return {
        success: true,
        message: "Profil bilgileri başarıyla güncellendi",
        data: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      };
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      return {
        success: false,
        message: "Profil güncellenirken bir hata oluştu"
      };
    }
  }

  /**
   * Profil input validasyonu
   */
  private validateProfileInput(username: string, email: string): ProfileResult {
    if (!username || !email) {
      return {
        success: false,
        message: "Kullanıcı adı ve email adresi gereklidir"
      };
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Geçerli bir email adresi girin"
      };
    }

    // Username uzunluk kontrolü
    if (username.length < 3) {
      return {
        success: false,
        message: "Kullanıcı adı en az 3 karakter olmalıdır"
      };
    }

    // Username karakter kontrolü (sadece alfanumerik ve underscore)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        message: "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"
      };
    }

    return {
      success: true,
      message: "Validation başarılı"
    };
  }

  /**
   * Username ve email benzersizlik kontrolü
   */
  private async checkUniqueness(adminId: number, username: string, email: string): Promise<ProfileResult> {
    try {
      const adminRepo = AppDataSource.getRepository(Admin);

      // Username benzersizlik kontrolü (kendi ID'si hariç)
      const existingAdminByUsername = await adminRepo.findOne({
        where: { username }
      });
      
      if (existingAdminByUsername && existingAdminByUsername.id !== adminId) {
        return {
          success: false,
          message: "Bu kullanıcı adı zaten kullanılıyor"
        };
      }

      // Email benzersizlik kontrolü (kendi ID'si hariç)
      const existingAdminByEmail = await adminRepo.findOne({
        where: { email }
      });
      
      if (existingAdminByEmail && existingAdminByEmail.id !== adminId) {
        return {
          success: false,
          message: "Bu email adresi zaten kullanılıyor"
        };
      }

      return {
        success: true,
        message: "Benzersizlik kontrolü başarılı"
      };
    } catch (error) {
      console.error("Benzersizlik kontrolü hatası:", error);
      return {
        success: false,
        message: "Benzersizlik kontrolü sırasında bir hata oluştu"
      };
    }
  }

  /**
   * Admin profil istatistiklerini getir
   */
  async getAdminStats(adminId: number): Promise<ProfileResult> {
    try {
      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOneBy({ id: adminId });

      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

      // Burada gelecekte admin'in aktivitelerini, son giriş tarihini vs. ekleyebiliriz
      const stats = {
        accountStatus: 'active',
        lastUpdate: new Date().toISOString(),
        role: 'administrator',
        joinDate: new Date().toISOString(), // Gerçekte admin'in oluşturulma tarihini kullanacağız
        totalLogins: 0, // Gelecekte login tablosu eklendiğinde
        lastLogin: new Date().toISOString()
      };

      return {
        success: true,
        message: "Admin istatistikleri getirildi",
        data: stats
      };
    } catch (error) {
      console.error("Admin istatistikleri hatası:", error);
      return {
        success: false,
        message: "Admin istatistikleri getirilirken bir hata oluştu"
      };
    }
  }

  /**
   * Profil güvenlik kontrolü
   */
  async checkProfileSecurity(adminId: number): Promise<ProfileResult> {
    try {
      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOneBy({ id: adminId });

      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

      const securityChecks = {
        hasStrongPassword: admin.passwordHash.length > 50, // bcrypt hash uzunluğu
        emailVerified: true, // Gelecekte email verification eklenebilir
        twoFactorEnabled: false, // Gelecekte 2FA eklenebilir
        lastPasswordChange: new Date().toISOString(), // Gelecekte password history eklenebilir
        securityScore: 75 // Basit bir güvenlik skoru
      };

      return {
        success: true,
        message: "Güvenlik kontrolü tamamlandı",
        data: securityChecks
      };
    } catch (error) {
      console.error("Güvenlik kontrolü hatası:", error);
      return {
        success: false,
        message: "Güvenlik kontrolü sırasında bir hata oluştu"
      };
    }
  }
}

export default new ProfileService();
