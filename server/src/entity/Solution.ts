import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from "typeorm";
  import { SolutionTranslation } from "./SolutionTranslation";
  import { SolutionExtraContent } from "./SolutionExtraContent";
  
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
  }
  