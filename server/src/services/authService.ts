import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AppDataSource from "../data-source";
import { Admin } from "../entity/Admin";
import { PasswordResetToken } from "../entity/PasswordResetToken";
import mailService from "./mailService";

interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  admin?: {
    id: number;
    username: string;
    email: string;
  };
}

interface AuthResult {
  success: boolean;
  message: string;
  data?: any;
}

interface TokenValidationResult {
  success: boolean;
  message: string;
  admin?: {
    id: number;
    username: string;
    email: string;
  };
}

class AuthService {
  private readonly JWT_SECRET = "GIZLIANAHTAR";
  private readonly JWT_EXPIRES_IN = "1h";
  private readonly RESET_TOKEN_EXPIRES_MINUTES = 15;
  private readonly SALT_ROUNDS = 10;

  /**
   * Admin login işlemi
   */
  async login(identifier: string, password: string): Promise<LoginResult> {
    try {
      if (!identifier || !password) {
        return {
          success: false,
          message: "Kullanıcı adı/email ve şifre gereklidir"
        };
      }

      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOneBy([
        { username: identifier },
        { email: identifier },
      ]);

      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

      const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);
      if (!isPasswordCorrect) {
        return {
          success: false,
          message: "Şifre yanlış"
        };
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        message: "Giriş başarılı",
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      };
    } catch (error) {
      console.error("Login hatası:", error);
      return {
        success: false,
        message: "Giriş işlemi sırasında bir hata oluştu"
      };
    }
  }

  /**
   * Admin şifre değiştirme
   */
  async changePassword(adminId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      if (!currentPassword || !newPassword) {
        return {
          success: false,
          message: "Mevcut şifre ve yeni şifre gerekli"
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: "Yeni şifre en az 6 karakter olmalıdır"
        };
      }

      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOneBy({ id: adminId });

      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

      // Mevcut şifreyi kontrol et
      const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isCurrentPasswordCorrect) {
        return {
          success: false,
          message: "Mevcut şifre yanlış"
        };
      }

      // Yeni şifreyi hash'le ve güncelle
      const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      admin.passwordHash = newPasswordHash;
      await adminRepo.save(admin);

      return {
        success: true,
        message: "Şifre başarıyla değiştirildi"
      };
    } catch (error) {
      console.error("Şifre değiştirme hatası:", error);
      return {
        success: false,
        message: "Şifre değiştirilirken bir hata oluştu"
      };
    }
  }

  /**
   * JWT token validasyonu
   */
  async validateToken(adminId: number): Promise<TokenValidationResult> {
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
        message: "Token geçerli",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      };
    } catch (error) {
      console.error("Token validasyon hatası:", error);
      return {
        success: false,
        message: "Token kontrol edilirken bir hata oluştu"
      };
    }
  }

  /**
   * Şifre sıfırlama talebi
   */
  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      if (!email) {
        return {
          success: false,
          message: "Email adresi gereklidir"
        };
      }

      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOneBy({ email });

      // Güvenlik için admin bulunamadığında da başarılı mesajı döndürüyoruz
      const successMessage = "Eğer bu email adresine kayıtlı bir hesap varsa, şifre sıfırlama linki gönderilmiştir.";

      if (!admin) {
        return {
          success: true,
          message: successMessage
        };
      }

      // Eski token'ları temizle
      const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
      await tokenRepo.delete({ email });

      // Yeni token oluştur
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.RESET_TOKEN_EXPIRES_MINUTES);

      const passwordResetToken = tokenRepo.create({
        token: resetToken,
        email,
        admin,
        expiresAt,
        used: false
      });

      await tokenRepo.save(passwordResetToken);

      // Email gönder
      const emailSent = await mailService.sendPasswordResetEmail(email, resetToken);

      if (!emailSent) {
        return {
          success: false,
          message: "Email gönderilemedi. Lütfen daha sonra tekrar deneyin."
        };
      }

      return {
        success: true,
        message: successMessage
      };
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      return {
        success: false,
        message: "Şifre sıfırlama işlemi sırasında bir hata oluştu"
      };
    }
  }

  /**
   * Şifre sıfırlama
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      if (!token || !newPassword) {
        return {
          success: false,
          message: "Token ve yeni şifre gereklidir"
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: "Şifre en az 6 karakter olmalıdır"
        };
      }

      const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
      const resetToken = await tokenRepo.findOne({
        where: { token, used: false },
        relations: ['admin']
      });

      if (!resetToken) {
        return {
          success: false,
          message: "Geçersiz veya kullanılmış token"
        };
      }

      if (new Date() > resetToken.expiresAt) {
        return {
          success: false,
          message: "Token süresi dolmuş"
        };
      }

      // Şifreyi güncelle
      const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      const adminRepo = AppDataSource.getRepository(Admin);
      await adminRepo.update(resetToken.admin.id, { passwordHash });

      // Token'ı kullanıldı olarak işaretle
      resetToken.used = true;
      await tokenRepo.save(resetToken);

      return {
        success: true,
        message: "Şifre başarıyla sıfırlandı"
      };
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      return {
        success: false,
        message: "Şifre sıfırlanırken bir hata oluştu"
      };
    }
  }

  /**
   * Reset token validasyonu
   */
  async validateResetToken(token: string): Promise<AuthResult> {
    try {
      if (!token) {
        return {
          success: false,
          message: "Token gereklidir"
        };
      }

      const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
      const resetToken = await tokenRepo.findOne({
        where: { token, used: false }
      });

      if (!resetToken) {
        return {
          success: false,
          message: "Geçersiz veya kullanılmış token"
        };
      }

      if (new Date() > resetToken.expiresAt) {
        return {
          success: false,
          message: "Token süresi dolmuş"
        };
      }

      return {
        success: true,
        message: "Token geçerli",
        data: { email: resetToken.email }
      };
    } catch (error) {
      console.error("Token validasyon hatası:", error);
      return {
        success: false,
        message: "Token kontrol edilirken bir hata oluştu"
      };
    }
  }

  /**
   * JWT token oluştur
   */
  generateToken(payload: { id: number; email: string }): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  /**
   * JWT token'ı decode et
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error("Geçersiz token");
    }
  }

  /**
   * Şifre hash'le
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Şifre karşılaştır
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Admin profil bilgilerini getir
   */
  async getAdminProfile(adminId: number): Promise<AuthResult> {
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
  async updateAdminProfile(adminId: number, username: string, email: string): Promise<AuthResult> {
    try {
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

      const adminRepo = AppDataSource.getRepository(Admin);
      
      // Mevcut admin'i bul
      const admin = await adminRepo.findOneBy({ id: adminId });
      if (!admin) {
        return {
          success: false,
          message: "Admin bulunamadı"
        };
      }

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
}

export default new AuthService();
