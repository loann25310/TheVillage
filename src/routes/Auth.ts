import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {log} from "util";
import * as console from "console";
const passport = require("passport");
const bcrypt = require('bcrypt');
//pour hash le mdp
const saltRounds = 10;


export function Route(router: Router) {

    router.get('/auth', (req, res) => {
        if (req.session['passport']){
            return res.redirect('/');
        }
        res.render('auth/login', {failed: req.query.failed});
    });

    router.get('/logout', (req, res) => {
        if (req.session["passport"])
            req.session["passport"] = undefined;
        return res.redirect("/auth");
    })

    router.get('/auth/inscription', (req, res) => {
        res.render('auth/inscription', {err: req.query.erreur})
    })

    router.post("/auth/verifInscription", (req, res) => {
        bcrypt.hash(req.body.password, saltRounds, (err, hash) =>{

            if (err){
                console.log(err)
                return res.redirect("/auth/inscription?erreur=1")
            }

            const repo = getRepository(User)
            let user = new User();
            user.Pseudo = req.body.pseudo;
            user.Password = hash;
            user.Nom = req.body.nom;
            user.Prenom = req.body.prenom;
            user.AdresseMail = req.body.mail;
            user.DateDeNaissance = req.body.ddn;
            user.Niveau = 1;
            user.Argent = 0;
            user.NbPartiesGagnees = 0;
            user.NbPartiesJouees = 0;
            user.Succes = []
            user.Skins = []
            repo.save(user).then(r => {
                console.log(JSON.stringify(r));
                passport.serializeUser(r, () => {
                    res.redirect("/")
                });
            });

        })
    })

    router.post('/auth/loginRequest', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth?failed=1'
    }));
}