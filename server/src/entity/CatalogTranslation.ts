import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Catalog } from "./Catalog";

@Entity()
export class CatalogTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  language!: string; // "tr", "en", "de", "fr" gibi

  @Column({ type: "nvarchar", length: 255, nullable: true }) // ✅ nullable ekle
name!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    filePath!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  fileUrl!: string;


  @ManyToOne(() => Catalog, catalog => catalog.translations, { onDelete: "CASCADE" })
  catalog!: Catalog;
}
