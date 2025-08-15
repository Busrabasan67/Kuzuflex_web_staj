import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Admin } from "./Admin";

@Entity()
export class PasswordResetToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    token!: string;

    @Column()
    email!: string;

    @ManyToOne(() => Admin)
    admin!: Admin;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    expiresAt!: Date;

    @Column({ default: false })
    used!: boolean;
}
