import {Displayable} from "../Displayable";
import {TaskList} from "../types/TaskList";


export class HUD {
    ctx: CanvasRenderingContext2D;
    taskList:TaskList;
    private killBt:HTMLImageElement;
    private interactBt:HTMLImageElement;
    constructor(ctx:CanvasRenderingContext2D,taskList:TaskList) {
       this.ctx = ctx;
       this.taskList = taskList;
       this.killBt = new Image();
       this.interactBt = new Image();
       this.killBt.src = "/img/skull.jpg"
        this.interactBt.src = "/img/action.png"
    }
    public drawRectangle(){
        this.ctx.clearRect(innerWidth - 70, innerHeight - 65,70 ,70 );
        this.ctx.clearRect(innerWidth-140,innerHeight-65,60,60);
        this.ctx.fillStyle = "#484848"
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.killBt,innerWidth-70,innerHeight-65,60,60);
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.interactBt,innerWidth-140,innerHeight-65,60,60);
        this.ctx.globalAlpha = 1;
        this.drawBtOutlines();


    }
    public drawBtOutlines(){
        this.ctx.strokeStyle = "white"
        this.ctx.lineWidth = 5
        this.ctx.strokeRect(innerWidth - 70,innerHeight-65,60,60)
        this.ctx.strokeRect(innerWidth - 135,innerHeight-65,60,60)
    }
    public activateInteractButton(){
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.interactBt,innerWidth-140,innerHeight-65,60,60);
    }
    public displayTaskList(){
        this.ctx.clearRect(0,0,innerWidth/4,innerHeight/3);
        this.ctx.strokeStyle = "white"
        this.ctx.rect(0,0,innerWidth/4,innerHeight/3);
        this.ctx.stroke();
        this.ctx.fillStyle = "#FFFF99";
        this.ctx.fill();
        this.writeTask();
    }
    public writeTask(){

        this.ctx.fillStyle = "black"
        let width = 15
        let height = 0
        this.ctx.font = "15px Nosifer";
        this.ctx.textAlign="start";
        for (let i = 0; i <4 ; i++) {

            height +=30;
            this.ctx.fillText("* "+ this.taskList.tasks[i].description,width,height)
        }
    }
    public clicked(e){
        e.preventDefault();
        var x = e.clientX;
        var y = e.clientY
        console.log("click");

        if(x > innerWidth -140 && x < innerWidth-70 && y > innerHeight -65 && y < innerHeight){
            alert('Mini-game Time!');
        }
    }
}