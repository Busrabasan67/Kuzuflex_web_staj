import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { AboutPage } from "./AboutPage";

@Entity({ name: "about_page_translation" })
@Unique(["page", "language"]) // Her sayfa için her dil tekil olmalı
export class AboutPageTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ length: 5 })
  language!: string; // tr, en, de, fr

  @Column()
  title!: string;

  @ManyToOne(() => AboutPage, (p) => p.translations, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pageId" })
  page!: AboutPage;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt!: Date;
}
