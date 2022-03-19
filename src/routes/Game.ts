import {RequestHandler, Router} from "express";
import {Server as SocketIOServer} from "socket.io";
import {getRepository} from "typeorm";
import {Partie} from "../entity/Partie";
import {User} from "../entity/User";
import * as fs from "fs";
import * as path from "path";
import {Roles} from "../entity/roles/Roles";

const passport = require("passport");

export function Route(router: Router, io: SocketIOServer, sessionMiddleware: RequestHandler) {

    router.get('/play/:id', async (req, res) => {

        let partie = await getRepository(Partie).findOne(req.params.id);

        if(!partie) return res.sendStatus(404);
        const user = req.user as User;
        let role = (partie.roles.filter(p => p.uid === user.id))[0]?.role;
        if (!role) role = Roles.Villageois;
        const LG = role === Roles.LoupGarou ? (partie.roles.filter(p => p.role === Roles.LoupGarou)).map(p => {
            return p.uid
        }) : [];
        //pour ne pas envoyer les rôles à tout le monde (aka anti-cheat ma gueule)
        partie.roles = [];
        let numeroJoueur = partie.players.indexOf(user.id);
        if (numeroJoueur < 0) return res.redirect("/?err=wrong_game");
        res.render("game/main", {
            partie,
            map: partie.getMap(fs, path),
            role,
            numeroJoueur,
            LoupsGarous: JSON.stringify(LG)
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
            next(new Error("unauthorized"));
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
            partie = monitorPartie(await getRepository(Partie).findOne(data.gameId));
            if(!partie) return sendError("Game not found");
            if(partie.isInGame(user)) return sendError("Is already in this game");
            partie.addInGamePlayer(user);
            socket.join(partie.id);
            io.to(partie.id).emit("playerJoin", {
                id: user.id,
                pseudo: user.pseudo,
                position: data.position,
                index: data.index
            });
        });

        socket.on("disconnect", () => {
            if(!partie) return;
            partie.removeInGamePlayer(user);
        });

        socket.on("playerMove", async (data) => {
            if(!partie) return;
            io.to(partie.id).emit("playerMove", {
                id: user.id,
                position: data.position,
                index: data.index
            });
        });

        socket.on("action", (data) => {
            if (!partie) return;
            switch (data.role) {
                case Roles.Sorciere:
                    return io.to(partie.id).emit(data.data.revive ? "revive" : "kill", data.data.player);
                case Roles.Voyante:
                    return socket.emit("see_role", {role: partie.roles.filter(p => p.uid === data.data.player)[0].role, id: data.data.player});
                case Roles.Chasseur:
                case Roles.LoupGarou:
                    return io.to(partie.id).emit("kill", data.data.player);
            }
        });

        socket.on("drink", pos => {
            if (!partie) return;
            io.to(partie.id).emit("drink", pos);
        });

        socket.on("task_completed",  (id, nb) => {
            if (!partie) return;
            let seen = false;
            for (const couple of partie.idTasks) {
                if (couple.id === id) {
                    couple.nb = nb;
                    seen = true;
                    break;
                }
            }
            if (!seen)
                partie.idTasks.push({id, nb});
            if (partie.idTasks.length !== partie.inGamePlayers.length) return;
            let compteur = 0;
            for (const c of partie.idTasks) {
                compteur += c.nb;
            }
            if (compteur > 0)
                io.to(partie.id).emit("nb_tasks", compteur);
            else
                io.to(partie.id).emit("DAY");
        });

        socket.on("new_night", (id, nb) =>{
            if (!partie) return;
            if(!partie.idTasks) partie.idTasks = [];
            for (const couple of partie.idTasks) {
                if (couple.id === id) {
                    couple.nb = nb;
                    return;
                }
            }
            partie.idTasks.push({id, nb});
        });
    });
}