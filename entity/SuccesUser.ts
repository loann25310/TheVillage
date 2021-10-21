import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToOne, ManyToMany, ManyToOne} from "typeorm";
import {Succes} from "./Succes.js";
import {User} from "./User.js";

@Entity()
export class SuccesUser{
    @OneToOne(type => Succes, succes => succes.id)
    @PrimaryColumn()
    Succes :Succes;

    @ManyToOne(type => User, user => user.id)
    @PrimaryColumn()
    User :User;

    @Column()
    Progression :number
}