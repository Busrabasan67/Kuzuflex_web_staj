import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class EmailSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "smtp.office365.com" })
  smtpHost!: string;

  @Column({ default: 587 })
  smtpPort!: number;

  @Column({ default: "TLS" })
  encryption!: string;

  @Column({ default: true })
  authentication!: boolean;

  @Column({ default: "wifi@kuzuflex.com" })
  smtpUsername!: string;

  @Column({ nullable: true })
  smtpPassword!: string;

  @Column({ default: "bilgiislem@kuzuflex.com" })
  contactFormRecipient!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
