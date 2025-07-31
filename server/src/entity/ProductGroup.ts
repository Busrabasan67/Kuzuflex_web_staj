import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { ProductGroupTranslation } from "./ProductGroupTranslation";

// Ürün gruplarının ortak verilerini tutan ana tablo
@Entity()
export class ProductGroup {
  @PrimaryGeneratedColumn()
  id!: number; // Benzersiz grup ID'si

  @Column({ nullable: true })
  imageUrl!: string; // Grup görselinin yolu

  @Column({ nullable: true })
  standard?: string; // Grup ile ilgili standart bilgisi (isteğe bağlı)

  // Her grup birden fazla ürüne sahip olabilir
  @OneToMany(() => Product, (product) => product.group)
  products!: Product[];

  // Her grup birden fazla dilde çeviriye sahip olabilir
  @OneToMany(() => ProductGroupTranslation, (translation) => translation.group, {
    cascade: true,
  })
  translations?: ProductGroupTranslation[];
}
