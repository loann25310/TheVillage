import {Router} from "express";
import {User} from "../entity/User";
import {Server} from "socket.io";
import {createRoom, disconnect, getAvailableRoom, joinRoom, show_Room} from "./lobby_server";
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
        if ((game = await joinRoom(user.id, game)) === null) return res.redirect("/?roomfull=1");
        let players = await game.getPlayers();
        let users = [];
        for (let p of players) {
            users.push({
                id: p.id,
                pseudo: p.pseudo,
                nbPartiesJouees: p.nbPartiesJouees,
                nbPartiesGagnees: p.nbPartiesGagnees,
                niveau: p.niveau,
                avatar: p.avatar
            });
        }
        io.to(roomId).emit("players", users);
        let bans = [];
        for (const b of game.bans) {
            let p = await getRepository(User).findOne(b);
            if (p)
                bans.push({id: p.id, pseudo: p.pseudo});
        }
        return res.render("lobby/lobby", {
            partie: JSON.stringify({
                id: game.id,
                nbJoueursMax: game.nbJoueursMax,
                players: users,
                dureeVote: game.dureeVote,
                dureeNuit: game.dureeNuit,
                publique: game.publique,
                bans
            }),
            gameMaster: game.gameMaster,
            user
        });
    });

    io.on("connection", async (socket) => {
        socket.on("ask_room", async (userId) =>{
            console.log("room_requested");
            socket.emit("room_found", await getAvailableRoom(userId));
        });
        socket.on("create_room", async () =>{
            console.log("room_requested");
            socket.emit("room_found", await createRoom());
        });
        socket.on("show_room", async () =>{
            console.log("room_showed");
            socket.emit("room_showing", await show_Room());
        });


        socket.on("chat_message", (user, msg, room) =>{
            io.to(room).emit("chat_message", user, msg);
        });

        socket.on("new_guy", async (uid :number, room) => {
            socket.data.uid = uid;
            socket.join(`${room}`);
            let r = await repo.findOne(room);
            if (!r) return;
            if (!r.players.includes(uid)){
                r.players.push(uid);
                if (r.gameMaster === 0)
                    r.gameMaster = uid;
                await repo.save(r);
            }
            io.to(room).emit("new_player", uid, socket.id);
            let players = await r.getPlayers();
            let users = [];
            for (let p of players) {
                users.push({
                    id: p.id,
                    pseudo: p.pseudo,
                    nbPartiesJouees: p.nbPartiesJouees,
                    nbPartiesGagnees: p.nbPartiesGagnees,
                    niveau: p.niveau,
                    avatar: p.avatar
                });
            }
            io.to(r.id).emit("players", users);
        });

        socket.on("disconnecting", async ()=>{
            await disconnect(socket.data.uid, io);
        });

        socket.on("change_max_players", async (roomId, playerId, nb) => {
            let room = await repo.findOne(roomId);
            if (playerId !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
            room.nbJoueursMax = nb;
            await repo.save(room);
            io.to(`${room.id}`).emit("change_max_players", nb);
        });

        socket.on("duree_vote", async (roomId, playerId, val) => {
            let room = await repo.findOne(roomId);
            if (playerId !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
            room.dureeVote = val;
            await repo.save(room);
            io.to(`${room.id}`).emit("duree_vote", val);
        });

        socket.on("duree_nuit", async (roomId, playerId, val) => {
            let room = await repo.findOne(roomId);
            if (playerId !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
            room.dureeNuit = val;
            await repo.save(room);
            io.to(`${room.id}`).emit("duree_nuit", val);
        });

        socket.on("start_game", async (roomId, uid) => {
            let room = await repo.findOne(roomId);
            if (uid !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
            room.start().then(() => {
                io.to(roomId).emit("start_game");
            });
        });

        socket.on("private", (roomId, playerId, bool) => {
            repo.findOne(roomId).then(room => {
                if (playerId !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
                room.publique = !bool;
                repo.save(room).then(()=> io.to(roomId).emit('private', bool));
            });
        });

        socket.on("ban", (roomId, playerId, banId) => {
            repo.findOne(roomId).then( async room => {
                if (playerId !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
                if (room.bans.includes(banId)) return;
                room.bans.push(banId);
                let bans = [];
                for (const b of room.bans) {
                    let p = await getRepository(User).findOne(b);
                    if (p)
                        bans.push({id: p.id, pseudo: p.pseudo});
                }
                repo.save(room).then(()=> io.to(roomId).emit('ban', banId, bans));
            });
        });

        socket.on("unban", (roomId, uid, banId) => {
            repo.findOne(roomId).then( async room => {
                if (uid !== room.gameMaster) return io.to(roomId).emit("game_master", room.gameMaster);
                room.bans.splice(room.bans.indexOf(banId.id), 1);
                let bans = [];
                for (const b of room.bans) {
                    let p = await getRepository(User).findOne(b);
                    if (p)
                        bans.push({id: p.id, pseudo: p.pseudo});
                }
                repo.save(room).then(()=> io.to(room.id).emit('unban', banId, bans));
            });
        });

        socket.on("get_game_master", room => {
            getRepository(Partie).findOne(room).then(r => {
                io.to(room).emit("game_master", r.gameMaster);
            });
        });
    });
}