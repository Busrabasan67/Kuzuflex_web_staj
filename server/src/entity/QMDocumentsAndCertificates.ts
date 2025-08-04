import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { QMDocumentsAndCertificatesTranslations } from "./QMDocumentsAndCertificatesTranslation";

export type QMDocumentType = 'certificate' | 'document';

@Entity()
export class QMDocumentsAndCertificates {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  slug!: string;

  @Column({ nullable: true })
  imageUrlTr?: string;

  @Column({ nullable: true })
  imageUrlEn?: string;

  @Column({ nullable: true })
  pdfUrlTr?: string;

  @Column({ nullable: true })
  pdfUrlEn?: string;

  @Column({ type: 'nvarchar', default: 'document' }) // 🔧 enum yerine string
  type!: QMDocumentType;

  @Column({ type: 'bit', default: false })
  isInternational!: boolean;
  

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
createdAt!: Date;

@Column({ type: 'datetime', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
updatedAt!: Date;


  @OneToMany(() => QMDocumentsAndCertificatesTranslations, translation => translation.document, {
    cascade: true,
  })
  translations?: QMDocumentsAndCertificatesTranslations[];
}
