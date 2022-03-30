import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from "typeorm";
import {Skin} from "./Skin";
import {Succes} from "./Succes";

export enum UserColor {
    blanc = "blanc",
    bleu = "bleu",
    bleu_clair = "bleu_clair",
    gris = "gris",
    jaune = "jaune",
    orange = "orange",
    rose = "rose",
    rouge = "rouge",
    vert = "vert",
    vert_clair = "vert_clair"
}

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

    @Column({
        default: 1
    })
    niveau :number;

    @Column({
        default: 0
    })
    argent: number;

    @Column({
        default: 0
    })
    nbPartiesGagnees: number;

    @Column({
        default: 0
    })
    nbPartiesJouees: number;

    @Column({
        default: ""
    })
    partie: string;

    @Column()
    avatar: string;

    @Column({
        default: UserColor.gris
    })
    color: UserColor;

    @ManyToMany(() => Succes)
    succes: Succes[];

    @ManyToMany(() => Skin)
    skins: Skin[];
}