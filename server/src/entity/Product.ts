import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToMany } from "typeorm";
// src/entity/Product.ts
import { ProductGroup } from "./ProductGroup";
import { Catalog } from "./Catalog";
import { ProductTranslation } from "./ProductTranslation";

//alta başlıklar
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  standard?: string;

  //Bir ürün, bir ProductGroup'a ait olabilir. (isteğe bağlı ✅)
  @ManyToOne(() => ProductGroup, group => group.products, { nullable: true, onDelete: 'SET NULL' })
  group?: ProductGroup;


  //Her ürünün birden fazla katalog PDF'i olabilir: 
  @OneToMany(() => Catalog, catalog => catalog.product)
  catalogs?: Catalog[];

  @OneToMany(() => ProductTranslation, translation => translation.product, {
    cascade: true,
  })
  translations?: ProductTranslation[];
}
