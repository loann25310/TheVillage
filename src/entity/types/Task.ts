export class Task {
    id:number;
    private _description:string;
    completed:boolean;

    constructor(id:number,description:string) {
        this.id = id;
        this._description = description;
        this.completed = false;
    }

    public completion(){
        this.completed = true;
    }


    get description(): string {
        return this._description;
    }
}