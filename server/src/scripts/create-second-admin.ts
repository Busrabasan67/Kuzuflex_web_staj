// src/scripts/create-second-admin.ts
import  AppDataSource  from "../data-source";
import { Admin } from "../entity/Admin";
import bcrypt from "bcrypt";

const main = async () => {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Admin);

  const hashed = await bcrypt.hash("yeniSifre123", 10);

  const newAdmin = repo.create({
    username: "admin2",
    email: "admin2@example.com",
    passwordHash: hashed,
  });

  await repo.save(newAdmin);
  console.log("✅ İkinci admin başarıyla eklendi!");

  await AppDataSource.destroy();
};

main().catch(console.error);
