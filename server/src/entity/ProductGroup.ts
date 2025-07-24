import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { ProductGroupTranslation } from "./ProductGroupTranslation";


// ana başlıklar
@Entity()
export class ProductGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "nvarchar", nullable: true, length: "MAX" })
  description?: string;
 

  @Column({ nullable: true })
  imageUrl!: string;
  
  @Column({ nullable: true })
  standard?: string;


  //Her grup birden fazla ürüne sahip olabilir. 
  @OneToMany(() => Product, (product) => product.group)
  products!: Product[];

  @OneToMany(() => ProductGroupTranslation, (translation) => translation.group, {
    cascade: true,
  })
  translations?: ProductGroupTranslation[];

}
