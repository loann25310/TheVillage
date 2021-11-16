import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {Server as SocketIOServer, Socket} from "socket.io";
import {findRoom} from "../scripts/lobby_server";

let userRepository = getRepository(User);


async function getOdysee(){

    let i  = await userRepository.findOne({pseudo:"Odysee"});
    //console.log(i.pseudo);
    return i.pseudo;

}
function get2DigitsMinutes(d){
    let minutes = d.getMinutes()
    if(d.getMinutes() < 10){
        minutes = "0" + minutes
    }
    return minutes;
}

export function Route(router: Router, io: SocketIOServer) {
    router.get('/lobby', (req, res) => {


        res.render('lobby/lobby',{
            user: req.user
        });
    });

    io.on("connection", async (socket) =>{
        console.log("ENFIN !!!!")
        io.to(socket.id).emit("connected");
        socket.on("ask_room", async (userId) =>{
            console.log("ask room server")
            await findRoom(socket, userId);
        })
    })
}

