import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ProductGroup } from "./ProductGroup";

// Ürün grubu çevirilerini tutan tablo
@Entity()
export class ProductGroupTranslation {
  @PrimaryGeneratedColumn()
  id!: number; // Benzersiz çeviri ID'si

  @Column()
  language!: string; // Dil kodu ('tr', 'en', 'fr', 'de')

  @Column()
  name!: string; // Grup adı (çeviri)

  @Column({ type: 'nvarchar', length: 'MAX' })
  description!: string; // Grup açıklaması (çeviri)

  @ManyToOne(() => ProductGroup, (group) => group.translations, {
    onDelete: 'CASCADE',
  })
  group!: ProductGroup; // Bağlı olduğu grup
}
