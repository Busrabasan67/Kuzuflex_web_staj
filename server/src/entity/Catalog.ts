import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Product } from "./Product";
import { CatalogTranslation } from "./CatalogTranslation";

@Entity()
export class Catalog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filePath!: string; // 📁 sunucu içindeki konum


  @ManyToOne(() => Product, product => product.catalogs, { onDelete: "CASCADE" })
  product!: Product;

  @OneToMany(() => CatalogTranslation, translation => translation.catalog, { cascade: true })
  translations!: CatalogTranslation[];
}
