import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Market } from "./Market";

@Entity()
export class MarketContent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // 'product', 'solution', 'certificate', 'contact', 'about'

  @Column()
  level!: string; // 'main' (üst başlık), 'sub' (alt başlık)

  @Column({ nullable: true })
  name?: string; // Sabit butonlar için (örn: "Sertifikalar", "About Us")

  @Column({ nullable: true })
  targetUrl?: string; // Yönlendirilecek URL (örn: "/products/gas-hoses")

  @Column({ nullable: true })
  productGroupId?: number; // ProductGroup'a referans (ürün butonları için)

  @Column({ nullable: true })
  productId?: number; // Product'a referans (ürün butonları için)

  @Column({ default: 0 })
  order!: number; // Sıralama için

  // Her içerik bir market'e ait
  @ManyToOne(() => Market, (market) => market.contents)
  market!: Market;

} 