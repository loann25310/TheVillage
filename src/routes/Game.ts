import {RequestHandler, Router} from "express";
import {Server as SocketIOServer, Socket} from "socket.io";
import * as logger from "node-color-log";
import {Coordinate} from "../entity/types/Coordinate";
import {Box} from "../entity/Props/Box";
import {getRepository} from "typeorm";
import {Partie} from "../entity/Partie";
import {User} from "../entity/User";
import * as fs from "fs";
import * as path from "path";
const session = require("express-session");
const passport = require("passport");

export function Route(router: Router, io: SocketIOServer, sessionMiddleware: RequestHandler) {

    router.get('/play/:id', async (req, res) => {

        let partie = await getRepository(Partie).findOne(req.params.id);

        if(!partie) return res.sendStatus(404);

        console.log(partie);

        res.render("game/main", {
            partie,
            map: partie.getMap(fs, path)
        });
    });

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));
    io.use((socket, next) => {
        if (socket.request["user"]) {
            next();
        } else {
            next(new Error("unauthorized"))
        }
    });

    getRepository(Partie).find().then(async (parties) => {
        for (const party of parties) {
            party.inGamePlayers = [];
            await getRepository(Partie).save(parties);
        }
    });

    const PARTIES: Partie[] = [];

    function monitorPartie(partie: Partie): Partie {
        if(!isMonitoredPartie(partie))
            PARTIES.push(partie);
        return findPartie(partie.id);
    }

    function isMonitoredPartie(partie: Partie): boolean {
        return findPartie(partie.id) !== null;
    }

    function findPartie(partieId: string): Partie {
        for (const monitoredPartie of PARTIES)
            if(monitoredPartie.id === partieId) return monitoredPartie;
        return null;
    }

    io.on("connection", (socket) => {
        let partie: Partie,
            user: User = socket.request["user"];

        function sendError(msg: string) {
            socket.emit("error", {
                type: 'error',
                message: msg
            });
            socket.disconnect();
        }

        socket.on("joinPartie", async (data) => {
            console.log(user, data);
            partie = monitorPartie(await getRepository(Partie).findOne(data.gameId));
            if(!partie) return sendError("Game not found");
            if(partie.isInGame(user)) return sendError("Is already in this game");
            partie.addInGamePlayer(user);
            socket.join(partie.id);
            io.to(partie.id).emit("playerJoin", {
                id: user.id,
                pseudo: user.pseudo,
                position: data.position
            });
        });

        socket.on("disconnect", (reason) => {
            if(!partie) return;
            partie.removeInGamePlayer(user);
        });

        socket.on("playerMove", async (data) => {
            if(!partie) return;
            io.to(partie.id).emit("playerMove", {
                id: user.id,
                position: data.position
            });
        });

    });


}