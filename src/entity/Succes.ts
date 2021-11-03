import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Succes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column()
    description: string;

    @Column()
    nombreAAtteindre: number;
}
