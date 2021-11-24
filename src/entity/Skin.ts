import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";

@Entity()
export class Skin{

    @PrimaryGeneratedColumn()
    id :number;

    @Column()
    lien :string;

    @Column()
    description :string;

    @Column()
    prix :number;
}