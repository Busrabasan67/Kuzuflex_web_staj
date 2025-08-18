import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { QMDocumentsAndCertificates } from "./QMDocumentsAndCertificates";

@Entity()
export class QMDocumentsAndCertificatesTranslations {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 10 })
  language!: string;

  @Column({ nullable: true })
  title?: string;

  @ManyToOne(() => QMDocumentsAndCertificates, document => document.translations, {
    onDelete: 'CASCADE'
  })
  document!: QMDocumentsAndCertificates;
} 