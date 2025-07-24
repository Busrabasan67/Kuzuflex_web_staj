import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Entity()
export class ProductTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  language!: string; // 'tr', 'en', 'fr', 'de'

  @Column()
  title!: string;

  @Column({ type: 'varchar', length: 'MAX' }) 
  description!: string;

  @ManyToOne(() => Product, (product) => product.translations, {
    onDelete: 'CASCADE',
  })
  product!: Product;
}
