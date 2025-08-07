import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { SolutionTranslation } from "./SolutionTranslation";
  import { SolutionExtraContent } from "./SolutionExtraContent";
  import { Market } from "./Market";
  
  @Entity()
  export class Solution {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    slug!: string; // URL için SEO dostu tanım

    @Column()
    imageUrl!: string;

    @Column({ default: false })
    hasExtraContent!: boolean; // Özel içerik var mı?
  
    @OneToMany(() => SolutionTranslation, t => t.solution, { cascade: true })
   translations!: SolutionTranslation[];

   @OneToMany(() => SolutionExtraContent, e => e.solution, { cascade: true })
   extraContents!: SolutionExtraContent[];

   // Her çözüm bir market'e ait olabilir (opsiyonel)
   @ManyToOne(() => Market, (market) => market.solutions, { nullable: true })
   market?: Market;

   @CreateDateColumn({ type: "datetime" })
   createdAt!: Date;

   @UpdateDateColumn({ type: "datetime" })
   updatedAt!: Date;
  }
  