import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Market } from "./Market";

@Entity()
export class MarketTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  language!: string; // Dil kodu ('tr', 'en', 'fr', 'de')

  @Column()
  name!: string; // Market adı (örn: "Gas Applications")

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description?: string; // Market açıklaması

  @ManyToOne(() => Market, (market) => market.translations, {
    onDelete: 'CASCADE',
  })
  market!: Market;
} 