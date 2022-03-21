import {Task} from "./Task";

export class TaskList{
    tasks:Array<Task>
    static descriptions:Array<string> = ["trouver le code secret","tirer sur 5 oiseaux","ramasser les feuilles","se rendre à la botte"]

    constructor() {
        TaskList.shuffleArray();
        this.tasks = new Array<Task>();
        for (let i = 0; i < 5 ; i++) {
            let task:Task = new Task(i,TaskList.descriptions[i])
            this.tasks.push(task)
        }


    }

     static shuffleArray(){
         for (let i = this.descriptions.length-1; i >0; i--) {
             let j = Math.floor(Math.random()*(i + 1))
             let temp:string = this.descriptions[i]
             this.descriptions[i] = this.descriptions[j]
             this.descriptions[j] = temp
         }
         console.log(this.descriptions.toString())

    }
}