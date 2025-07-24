import {Entity,PrimaryGeneratedColumn,Column} from "typeorm";

@Entity()
export class Admin{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column({unique:true})
    username!:string;

    @Column({unique:true})
    passwordHash!:string;

    @Column()
    email!:string;

}