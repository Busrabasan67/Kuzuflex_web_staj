 //# API endpoint'lerini yöneten fonksiyonlar (request-response)
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppDataSource  from "../data-source";
import { Admin } from "../entity/Admin";





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
