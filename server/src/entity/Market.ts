import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { MarketTranslation } from "./MarketTranslation";
import { ProductGroup } from "./ProductGroup";
import { Solution } from "./Solution";
import { MarketContent } from "./MarketContent";

@Entity()
export class Market {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  slug!: string; // URL için SEO dostu tanım (örn: "gas-applications")

  @Column({ nullable: true })
  imageUrl?: string; // Market görseli

  @Column({ default: 0 })
  order!: number; // Footer'da sıralama için

  @Column({ default: true })
  isActive!: boolean; // Market aktif mi?

  @Column({ default: false })
  hasProducts!: boolean; // Bu market'in ürünleri var mı?

  @Column({ default: false })
  hasSolutions!: boolean; // Bu market'in çözümleri var mı?

  @Column({ default: false })
  hasCertificates!: boolean; // Bu market'in sertifikaları var mı?

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt!: Date; // Oluşturulma tarihi

  @Column({ type: 'datetime', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
  updatedAt!: Date; // Güncellenme tarihi

  // Her market birden fazla dilde çeviriye sahip olabilir
  @OneToMany(() => MarketTranslation, (translation) => translation.market, {
    cascade: true,
  })
  translations!: MarketTranslation[];

  // Her market birden fazla ürün grubuna sahip olabilir
  @OneToMany(() => ProductGroup, (productGroup) => productGroup.market)
  productGroups!: ProductGroup[];

  // Her market birden fazla çözüme sahip olabilir
  @OneToMany(() => Solution, (solution) => solution.market)
  solutions!: Solution[];

  // Her market birden fazla içeriğe sahip olabilir (üst/alt başlıklar)
  @OneToMany(() => MarketContent, (content) => content.market)
  contents!: MarketContent[];
} 