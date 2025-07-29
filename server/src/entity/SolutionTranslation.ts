import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { Solution } from "./Solution";
  
  @Entity()
  export class SolutionTranslation {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    language!: string; // Dil kodu (en, tr, de, etc.)
  
    @Column()
    title!: string;

    @Column()
    subtitle!: string;
  
    @Column("nvarchar", { length: "MAX" })
    description!: string;

    @ManyToOne(() => Solution, s => s.translations, { onDelete: "CASCADE" })
    @JoinColumn({ name: "solutionId" })
    solution!: Solution;
  }
  