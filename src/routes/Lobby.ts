import {Router} from "express";
import {User} from "../entity/User";
import {Server} from "socket.io";
import {disconnect, getAvailableRoom, joinRoom} from "./lobby_server";
import {getRepository} from "typeorm";
import {Partie} from "../entity/Partie";

export function Route(router: Router, io: Server) {

    let repo = getRepository(Partie);


    router.get('/lobby/:room', async (req, res) => {
        let user = req.user as User;
        if(!user) return res.redirect('/?notlogged');
        let roomId = req.params.room;
        let game = await getRepository(Partie).findOne(roomId);
        if (game?.bans?.includes(user.id)) return res.redirect("/?banned=1");
        if ((game = await joinRoom(user.id, game)) !== null) {
            let players = await game.getPlayers();
            let users = []
            for (let p of players) {
                users.push({
                    id: p.id,
                    pseudo: p.pseudo,
                    nbPartiesJouees: p.nbPartiesJouees,
                    nbPartiesGagnees: p.nbPartiesGagnees,
                    niveau: p.niveau,
                    avatar: p.avatar
                })
            }
            io.to(roomId).emit("players", users);
            let bans = [];
            for (const b of game.bans) {
                let p = await getRepository(User).findOne(b);
                bans.push({id: p.id, pseudo: p.pseudo});
            }
            return res.render("lobby/lobby", {
                partie: JSON.stringify({
                    id: game.id,
                    nbJoueursMax: game.nbJoueursMax,
                    players: users,
                    dureeVote: game.dureeVote,
                    publique: game.publique,
                    bans
                }),
                gameMaster: game.gameMaster,
                user
            });
        }
        res.redirect("/?roomfull=1")
    });

    io.on("connection", async (socket) =>{
        socket.on("ask_room", async (userId) =>{
            socket.emit("room_found", await getAvailableRoom(userId));
        });

        socket.on("chat_message", (user, msg, room) =>{
            io.to(room).emit("chat_message", user, msg)
        });

        socket.on("new_guy", (uid :number, room) => {
            socket.data.uid = uid;
            socket.join(`${room}`)
            io.to(room).emit("new_player", uid, socket.id);
        })

        socket.on("disconnecting", ()=>{
            disconnect(socket.data.uid, io);
        })

        socket.on("change_max_players", async (id, nb) => {
            let room = await repo.findOne(id);
            room.nbJoueursMax = nb;
            await repo.save(room);
            io.to(`${room.id}`).emit("change_max_players", nb);
        });

        socket.on("duree_vote", async (id, val) => {
            let room = await repo.findOne(id);
            room.dureeVote = val;
            await repo.save(room);
            io.to(`${room.id}`).emit("duree_vote", val);
        })

        socket.on("start_game", async gameId => {
            let room = await repo.findOne(gameId);
            room.start();
            io.to(gameId).emit("start_game");
        });

        socket.on("private", (gameId, bool) => {
            repo.findOne(gameId).then(room => {
                room.publique = !bool;
                repo.save(room).then(()=> io.to(gameId).emit('private', bool));
            })
        });

        socket.on("ban", (gameId, uid) => {
            repo.findOne(gameId).then( async room => {
                if (room.bans.includes(uid)) return;
                room.bans.push(uid);
                let bans = [];
                for (const b of room.bans) {
                    let p = await getRepository(User).findOne(b);
                    bans.push({id: p.id, pseudo: p.pseudo});
                }
                repo.save(room).then(()=> io.to(gameId).emit('ban', uid, bans));
            })
        });

        socket.on("unban", (room, player) => {
            repo.findOne(room).then( async room => {
                room.bans.splice(room.bans.indexOf(player.id), 1)
                let bans = [];
                for (const b of room.bans) {
                    let p = await getRepository(User).findOne(b);
                    bans.push({id: p.id, pseudo: p.pseudo});
                }
                repo.save(room).then(()=> io.to(room.id).emit('unban', player, bans));
            })
        })
    })
}