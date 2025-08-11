import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { AboutPageTranslation } from "./AboutPageTranslation";
import { AboutPageExtraContent } from "./AboutPageExtraContent";

@Entity({ name: "about_page" })
export class AboutPage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  slug!: string; // e.g. "about-us"

  @Column({ nullable: true })
  heroImageUrl?: string;

  @OneToMany(() => AboutPageTranslation, (t) => t.page, { cascade: true })
  translations!: AboutPageTranslation[];

  @OneToMany(() => AboutPageExtraContent, (c) => c.page, { cascade: true })
  extraContents!: AboutPageExtraContent[];

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt!: Date;
}


