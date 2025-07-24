import { Entity, PrimaryGeneratedColumn, Column,ManyToOne} from "typeorm";
import { Product } from "./Product";


  // alt başlıkların 0 veya daha fazla katalogu olabilir
  @Entity()
  export class Catalog {  // 
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // Örn: Teknik Katalog

  @Column()
  fileUrl!: string; // Sunucudaki dosya yolu

//PDF silinse bile ürün kalır ama ürün silinirse PDF’ler de silinir.

  @ManyToOne(() => Product, (product: Product) => product.catalogs, { onDelete: 'CASCADE' })
  product!: Product;
}
