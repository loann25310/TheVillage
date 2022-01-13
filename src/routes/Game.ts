import {Router} from "express";
import {Server as SocketIOServer, Socket} from "socket.io";
import * as logger from "node-color-log";
import {Coordinate} from "../entity/types/Coordinate";
import {Box} from "../entity/Props/Box";

export function Route(router: Router, io: SocketIOServer) {

    router.get('/play/:id', (req, res) => {
        res.render("game/main")
    });

    let players: {
        pid: number,
        cord: Coordinate
    }[] = [];

    let boxes: {
        by: number,
        cord: Coordinate
    }[] = [];

/*    io.on("connection", (socket) => {

        let pid = players.push({
            pid: players.length,
            cord: { x: 0, y: 0 }
        }) - 1;

        logger.info("New Client Connected !");

        socket.emit("ppid", { pid });
        io.emit("newPlayer", { remotePlayer: players[pid] });

        for (const player of players) {
            socket.emit("newPlayer", { remotePlayer: player });
        }
        for (const box of boxes) {
            socket.emit("boxPlaced", box);
        }

        socket.on("move", (cord: Coordinate) => {
            players[pid].cord = cord;
            io.emit("movePlayer", { pid, cord });
        });

        socket.on("box", (cord: Coordinate) => {
            boxes.push({ by: pid, cord });
            io.emit("boxPlaced", { by: pid, cord });
        });

        socket.on("disconnect", () => {
            io.emit("removePlayer", { remotePlayer: players[pid] });
            players[pid] = null;
        });

    });
    */



}