import {Entity, Column, PrimaryColumn, OneToOne, ManyToOne} from "typeorm";
import {Skin} from "./Skin.js";
import {User} from "./User.js"


@Entity()
export class SkinPossede{

    @OneToOne(type=> Skin)
    @PrimaryColumn()
    Skin :Skin;

    @ManyToOne(type => User, user => user.Skins)
    @PrimaryColumn()
    User :User;
}