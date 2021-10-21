import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {SuccesUser} from "./SuccesUser";
import {SkinPossede} from "./SkinPossede";
import {Skin} from "./Skin";

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

    @OneToMany(type => SuccesUser, succesUser => succesUser.User)
    Succes :SuccesUser;

    @OneToMany(type => SkinPossede, skinPossede => skinPossede.User)
    Skins : SkinPossede;
}

