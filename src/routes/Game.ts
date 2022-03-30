import {RequestHandler, Router} from "express";
import {Server as SocketIOServer} from "socket.io";
import {getRepository} from "typeorm";
import {Partie, PartieStatus} from "../entity/Partie";
import {User} from "../entity/User";
import * as fs from "fs";
import * as path from "path";
import {Roles} from "../entity/types/Roles";
import {ActionType} from "../entity/types/ActionType";

const passport = require("passport");

export function Route(router: Router, io: SocketIOServer, sessionMiddleware: RequestHandler) {

    router.get('/play/:id', async (req, res, next) => {

        let partie = await getRepository(Partie).findOne(req.params.id);

        if(!partie) return next();
        if (partie.status === PartieStatus.ENDED) return res.redirect("/");
        const user = req.user as User;
        if (partie.status > PartieStatus.STARTING) {
            const p = findPartie(partie.id);
            partie.removeInGamePlayer(user);
            if (p) {
                p.kill(user.id);
                const t = p.idTasks.find(p => p.id === user.id);
                if (t.tasks.length !== 0) {
                    if (t) t.tasks = [];
                    await p.checkTasks(io);
                }
                const winner = await p.victoire();
                if (winner !== null) {
                    io.to(partie.id).emit("victoire", winner);
                }
            }
            return res.redirect("/?err=game_already_started");
        }
        let role = (partie.roles.filter(p => p.uid === user.id))[0]?.role;
        if (!role) role = Roles.Villageois;
        const LG = role === Roles.LoupGarou ? (partie.roles.filter(p => p.role === Roles.LoupGarou)).map(p => {
            return p.uid
        }) : [];
        //pour ne pas envoyer les rôles à tout le monde (aka anti-cheat ma gueule)
        partie.roles = [];
        let numeroJoueur = partie.players.indexOf(user.id);
        if (numeroJoueur < 0) return res.redirect("/?err=wrong_game");

        let roomId = req.params.id;
        let game = await getRepository(Partie).findOne(roomId);
        let players = await game.getPlayers();
        let users = [];
        for (let p of players) {
            let u = await getRepository(User).findOne(p.id);
            p.color = u.color;
            users.push(u);
        }
        io.to(roomId).emit("players", users);

        res.render("game/main", {
            partie,
            map: partie.getMap(fs, path),
            role,
            numeroJoueur,
            LoupsGarous: JSON.stringify(LG),
            user,
            players
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
        if(!isMonitoredPartie(partie)) {
            PARTIES.push(partie);
            partie.deadPlayers = [];
            partie.generateTasks();
        }
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

        socket.on("chat_message", (user, msg, room) =>{
            io.to(room).emit("message", user, msg);
        });

        socket.on("joinPartie", async (data) => {
            partie = monitorPartie(await getRepository(Partie).findOne(data.gameId));
            if(!partie) return sendError("Game not found");
            if(partie.isInGame(user)) return sendError("Is already in this game");
            partie.addInGamePlayer(user);
            if (partie.inGamePlayers.length === partie.players.length) io.to(partie.id).emit("everyone_is_here");
            socket.join(partie.id);
            io.to(partie.id).emit("playerJoin", {
                id: user.id,
                pseudo: user.pseudo,
                position: data.position,
                index: data.index,
                color: data.color
            });
            partie.status = PartieStatus.STARTED;
            await getRepository(Partie).save(partie);
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
                index: data.index,
                color: user.color
            });
        });

        socket.on("action", async (data) => {
            if (!partie) return;
            switch (data.role) {
                case Roles.Sorciere:
                    partie.addAction(data.data.maker, data.data.revive ? ActionType.REVIVE : ActionType.KILL, data.data.player);
                    if (data.data.revive)
                        partie.revive(data.data.player);
                    else {
                        partie.kill(data.data.player);
                        await partie.checkTasks(io);
                        let gagnant = await partie.victoire();
                        if (gagnant !== null) {
                            return io.to(partie.id).emit("victoire", gagnant);
                        }
                    }
                    return io.to(partie.id).emit(data.data.revive ? "revive" : "kill", data.data.player);
                case Roles.Voyante:
                    partie.addAction(data.data.maker,ActionType.REVEAL, data.data.player);
                    return socket.emit("see_role", {role: partie.roles.filter(p => p.uid === data.data.player)[0].role, id: data.data.player});
                case Roles.Chasseur:
                case Roles.LoupGarou:
                    partie.addAction(data.data.maker, ActionType.KILL, data.data.player);
                    partie.kill(data.data.player);
                    let gagnant = await partie.victoire();
                    if (gagnant !== null) {
                        return io.to(partie.id).emit("victoire", gagnant);
                    }
                    await partie.checkTasks(io);
                    return io.to(partie.id).emit("kill", data.data.player);
            }
        });

        socket.on("drink", data => {
            if (!partie) return;
            partie.addAction(data.id, ActionType.DRINK, 0);
            io.to(partie.id).emit("drink", data.pos);
        });

        socket.on("task_completed",  (id, name) => {
            if (!partie) return;
            const index = partie.idTasks.find(p => p.id === id).tasks.findIndex(p => p === name);
            if (index === -1) return;
            partie.idTasks.find(p => p.id === id).tasks.splice(index, 1);

            partie.checkTasks(io).then();
        });

        socket.on("get_tasks", async (id) => {
            if (!partie) {
                partie = findPartie((await getRepository(User).findOne(id))?.partie);
                if (!partie) return;
            }
            //emit only to send to the player that requested it
            socket.emit("tasks", partie.idTasks.find(p => p.id === id));
        });

        socket.on("aVote", async (id) => {
            const couple = partie.votes.find(p => p.id === id);
            if (couple === undefined) {
                partie.votes.push({id, nb_votes: 1});
            } else {
                couple.nb_votes ++;
            }
            let max = {id: -1, nb_votes: -1};
            let tie = false;
            let compteur = 0;
            for (const vote of partie.votes) {
                compteur += vote.nb_votes;
                if (vote.nb_votes > max.nb_votes) {
                    max = vote;
                    tie = false;
                } else
                    tie = vote.nb_votes === max.nb_votes && vote.id !== max.id;
            }
            if (compteur >= partie.players.length - partie.deadPlayers.length) {
                if (!tie) {
                    partie.kill(max.id);
                    partie.addAction(0, ActionType.EXPELLED, max.id);
                    io.to(partie.id).emit("final_kill", [...partie.deadPlayers, max.id]);
                } else {
                    io.to(partie.id).emit("final_kill", partie.deadPlayers);
                }
                const gagnant = await partie.victoire();
                if (gagnant !== null) {
                    return io.to(partie.id).emit("victoire", gagnant);
                }
                //Si tout le monde a voté (seulement)
                partie.generateTasks();
                io.to(partie.id).emit("NIGHT");
            }
        });

        socket.on("history", async () => {
            if (!partie) return;
            const history = await partie.getHistory();
            partie.history = history;
            await getRepository(Partie).save(partie);
            socket.emit("history", history);
        });
    });
}