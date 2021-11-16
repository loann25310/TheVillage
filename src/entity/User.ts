import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from "typeorm";
import {Skin} from "./Skin";
import {Succes} from "./Succes";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pseudo: string;

    @Column()
    password :string;

    @Column()
    adresseMail: string;

    @Column("date")
    dateDeNaissance :string;

    @Column()
    niveau :number;

    @Column()
    argent :number;

    @Column()
    nbPartiesGagnees :number;

    @Column()
    nbPartiesJouees :number;

    @Column()
    partie: number;

    @ManyToMany(() => Succes)
    succes :Succes[];

    @ManyToMany(() => Skin)
    skins : Skin[];
}

