// src/scripts/create-admin.ts
import AppDataSource  from "../data-source"; // AppDataSource'ın bulunduğu dosya
import { Admin } from "../entity/Admin";
import bcrypt from "bcrypt";

const run = async () => {
  await AppDataSource.initialize();

  const adminRepo = AppDataSource.getRepository(Admin);

  const username = "admin";
  const email = "admin@example.com";
  const plainPassword = "123456"; // düz şifre burada

  const existing = await adminRepo.findOneBy({ email });
  if (existing) {
    console.log("❗ Zaten bu email ile bir admin var.");
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10); // şifreyi hashle

  const newAdmin = adminRepo.create({
    username,
    email,
    passwordHash: hashedPassword,
  });

  await adminRepo.save(newAdmin);

  console.log("✅ Admin başarıyla kaydedildi.");
  await AppDataSource.destroy();
};

run().catch((err) => {
  console.error("💥 Hata:", err);
});
