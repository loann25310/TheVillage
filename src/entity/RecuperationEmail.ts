import {Column, Entity, OneToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class RecuperationEmail{

    @PrimaryColumn()
    code: string;

    @Column()
    email: string
}