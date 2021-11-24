import {Router} from "express";
import {getLibs} from "../scripts/libs";
import {User} from "../entity/User";
import {getRepository} from "typeorm";
const bcrypt = require('bcrypt');

export function Route(router: Router) {

    router.get('/', (req, res) => {
        console.log(req.session)
        res.render('main/menu', {connected: req.session["passport"]?.user});

    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

    router.get("/credits", async(req, res) => {
        let libs = await getLibs();
        res.render("main/credits", {lib: JSON.stringify(libs)})
    })
    router.get('/options', (req, res) => {
        res.render('main/options', {
            user: req.user
        });
    });

    router.put('/options/pseudo', async (req, res) => {
       let user = req.user as User;
       user.pseudo = req.body.pseudo;
       await getRepository(User).save(user);
       res.send({
           result: "ok"
       });
   });

    router.put('/options/email', async (req, res) => {
        let password = req.body.password;
        let user = req.user as User
        if (!(await bcrypt.compare(password, user.password))){
            res.send({
                result: "bad"
            });
        }else{
            user.adresseMail = req.body.email;
            await getRepository(User).save(user);
            res.send({
                result: "ok"
            });
        }
    });

    router.get('/profil', (req, res) => {
        res.render('main/profil', {
            user: req.user
        });
    });

}