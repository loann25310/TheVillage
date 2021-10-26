import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";

@Entity()
export class Skin{

    @PrimaryGeneratedColumn()
    id :number;

    @Column()
    Lien :string;

    @Column()
    Description :string;

    @Column()
    Prix :number;
}