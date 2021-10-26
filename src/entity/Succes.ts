import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Succes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Nom: string;

    @Column()
    Description: string;

    @Column()
    NombreAAtteindre: number;
}
