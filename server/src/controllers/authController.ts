 //# API endpoint'lerini yöneten fonksiyonlar (request-response)
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppDataSource  from "../data-source";
import { Admin } from "../entity/Admin";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}


export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  const adminRepo = AppDataSource.getRepository(Admin);

  const admin = await adminRepo.findOneBy([
    { username: identifier },
    { email: identifier },
  ]);

  if (!admin) {
    return res.status(401).json({ message: "Admin bulunamadı" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Şifre yanlış" });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    "GIZLIANAHTAR",
    { expiresIn: "1h" }
  );

  return res.json({ message: "Giriş başarılı", token });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user?.id; // JWT'den gelen admin ID'si

    if (!adminId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mevcut şifre ve yeni şifre gerekli" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalıdır" });
    }

    const adminRepo = AppDataSource.getRepository(Admin);
    const admin = await adminRepo.findOneBy({ id: adminId });

    if (!admin) {
      return res.status(404).json({ message: "Admin bulunamadı" });
    }

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Mevcut şifre yanlış" });
    }

    // Yeni şifreyi hash'le
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Şifreyi güncelle
    admin.passwordHash = newPasswordHash;
    await adminRepo.save(admin);

    return res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    console.error("Şifre değiştirme hatası:", error);
    return res.status(500).json({ message: "Şifre değiştirilirken bir hata oluştu" });
  }
};

export const validateToken = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Geçersiz token" });
    }

    const adminRepo = AppDataSource.getRepository(Admin);
    const admin = await adminRepo.findOneBy({ id: adminId });

    if (!admin) {
      return res.status(401).json({ message: "Admin bulunamadı" });
    }

    return res.json({ 
      message: "Token geçerli", 
      admin: { 
        id: admin.id, 
        username: admin.username, 
        email: admin.email 
      } 
    });
  } catch (error) {
    console.error("Token validasyon hatası:", error);
    return res.status(500).json({ message: "Token kontrol edilirken bir hata oluştu" });
  }
};
