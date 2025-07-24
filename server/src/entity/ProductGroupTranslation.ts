import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ProductGroup } from "./ProductGroup";

@Entity()
export class ProductGroupTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  language!: string; // 'tr', 'en', 'fr', 'de'

  @Column()
  name!: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  description!: string;
  

  @ManyToOne(() => ProductGroup, (group) => group.translations, {
    onDelete: 'CASCADE',
  })
  group!: ProductGroup;
}
