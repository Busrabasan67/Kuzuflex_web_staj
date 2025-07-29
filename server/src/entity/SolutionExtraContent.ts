import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,JoinColumn} from "typeorm";
import { Solution } from "./Solution";

@Entity()
export class SolutionExtraContent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // 'table', 'image', 'text', 'diagram'

  @Column()
  title!: string;

  @Column("nvarchar", { length: "MAX" })
  content!: string;

  @Column()
  order!: number;

  @Column()
  language!: string;

  @ManyToOne(() => Solution, s => s.extraContents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "solutionId" })
  solution!: Solution;
}
