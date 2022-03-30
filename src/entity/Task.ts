import {Displayable} from "./Displayables/Displayable";
import {Box} from "./Displayables/Props/Box";
import {PineTree} from "./Displayables/Props/PineTree";
import {HayBale} from "./Displayables/Props/HayBale";
import {House} from "./Displayables/Props/House";
import {Tree} from "./Displayables/Props/Tree";
import {Blood} from "./Displayables/Props/Blood";

export class Task {

    object: Displayable;

    text: string;

    done: boolean;

    static fromDisplayable(interaction: Displayable): Task {
        const task = new Task();
        task.object = interaction;
        task.done = false;

        switch (true) {
            case (interaction instanceof Box):
                task.text = `Refaire les lacets des chaussures à la boite`;
                break;
            case (interaction instanceof PineTree):
                task.text = `Attraper les pomme de pins`;
                break;
            case (interaction instanceof HayBale):
                task.text = `Trier les bottes de paille`;
                break;
            case (interaction instanceof House):
                task.text = `Nettoyer les carreaux de la maison`;
                break;
            case (interaction instanceof Tree):
                task.text = `Chasser les oiseaux bleus`;
                break;
            case (interaction instanceof Blood):
                task.text = `Boire la poche de sang`;
        }
        return task;
    }

}