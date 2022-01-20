import {Router} from "express";
import {Server as SocketIOServer, Socket} from "socket.io";
import * as logger from "node-color-log";
import {Coordinate} from "../entity/types/Coordinate";
import {Box} from "../entity/Props/Box";

export function Route(router: Router, io: SocketIOServer) {

    router.get('/game/:id', (req, res) => {
        res.render("game/main")
    });

    let players: {
        pid: number,
        cord: Coordinate
    }[] = [];
}