import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {SkinPossede} from "./SkinPossede.js";

@Entity()
export class Skin{

    @PrimaryGeneratedColumn()
    id :number;

    @Column()
    Lien :string

    @Column()
    Description :string

    @Column()
    Prix :number

    @OneToMany(type => SkinPossede, SkinPossede => SkinPossede.Skin)
    Joueurs :SkinPossede;
}