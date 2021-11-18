import {Router} from "express";
import {User} from "../entity/User";
import {getRepository} from "typeorm";

export function Route(router: Router) {

    router.get('/', (req, res) => {
        console.log(req.session)
        res.render('main/menu', {connected: req.session["passport"]?.user});

    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

    router.get('/options', (req, res) => {
        res.render('main/options', {
            user: req.user
        });
    });

    router.put('/options/pseudo', async (req, res) => {
       let user = req.user as User;
       user.Pseudo = req.body.pseudo;
       await getRepository(User).save(user);
       res.send({
           result: "ok"
       });
   });

    router.put('/options/email', async (req, res) => {
        let user = req.user as User;
        user.AdresseMail = req.body.email;
        await getRepository(User).save(user);
        res.send({
            result: "ok"
        });
    });

    router.get('/profil', (req, res) => {
        res.render('main/profil', {
            user: req.user
        });
    });

}