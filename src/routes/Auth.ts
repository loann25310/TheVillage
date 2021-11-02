import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import session from "express-session";
import {createDeflateRaw} from "zlib";
import {makeWatchHost} from "ts-loader/dist/servicesHost";
const passport = require("passport");
const bcrypt = require('bcrypt');
//pour hash le mdp
const saltRounds = 10;


export function Route(router: Router) {

    router.get('/auth', (req, res) => {
        if (req.session['passport'] && req.session["passport"].user){
            return res.redirect('/');
        }
        res.render('auth/login', {failed: req.query.failed, mail: req.query.mail});
    });

    router.get('/logout', (req, res) => {
        req.logout();
        return res.redirect("/");
    })

    router.get('/auth/inscription', (req, res) => {
        if (req.session['passport'] && req.session["passport"].user){
            return res.redirect('/');
        }
        res.render('auth/inscription', {
            erreur: req.query.erreur,
            prenom: req.query.prenom,
            nom: req.query.nom,
            pseudo: req.query.pseudo,
            mail: req.query.mail,
            ddn: req.query.ddn
        })
    })

    router.post("/auth/verifInscription", (req, res) => {
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) =>{

            if (err){
                console.log(err)
                return res.redirect("/auth/inscription?erreur=1")
            }

            const repo = getRepository(User)
            let u = await repo.find({AdresseMail: req.body.mail})
            if (u.length !== 0){
                return res.redirect(`/auth/inscription?erreur=2&pseudo=${req.body.pseudo}&prenom=${req.body.prenom}&nom=${req.body.nom}&mail=${req.body.mail}&ddn=${req.body.ddn}`)
            }
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
            repo.save(user).then((r) => {
                console.log(JSON.stringify(r));
                return res.redirect("/auth?mail=" + user.AdresseMail);
            });

        })
    })

    router.post('/auth/loginRequest', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth?failed=1'
    }));
}