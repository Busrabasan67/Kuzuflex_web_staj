import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { AboutPage } from "./AboutPage";

@Entity({ name: "about_page_extra_content" })
export class AboutPageExtraContent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ length: 5 })
  language!: string; // tr, en, de, fr

  @Column()
  title!: string;

  @Column("nvarchar", { length: "MAX" })
  content!: string;

  @Column()
  type!: string; // text, table, list, mixed

  @Column()
  order!: number;

  @ManyToOne(() => AboutPage, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pageId" })
  page!: AboutPage;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt!: Date;
}
