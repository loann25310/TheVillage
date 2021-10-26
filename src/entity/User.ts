import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from "typeorm";
import {Skin} from "./Skin";
import {Succes} from "./Succes";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Pseudo: string;

    @Column()
    Nom: string;

    @Column()
    Prenom: string;

    @Column()
    AdresseMail: string;

    @Column("date")
    DateDeNaissance :string;

    @Column()
    Niveau :number;

    @Column()
    Argent :number;

    @Column()
    NbPartiesGagnees :number;

    @Column()
    NbPartiesJouees :number;

    @ManyToMany(() => Succes)
    Succes :Succes[];

    @ManyToMany(() => Skin)
    Skins : Skin[];
}

