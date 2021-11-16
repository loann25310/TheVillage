import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import * as console from "console";
import {envoyerMail} from "../scripts/Mail";
import {verifMdp} from "../scripts/VerifMdp"
import {RecuperationEmail} from "../entity/RecuperationEmail";
import {deserializeUser} from "passport";
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
            pseudo: req.query.pseudo,
            mail: req.query.mail,
            ddn: req.query.ddn,
            missed: req.query.missed
        })
    })

    router.post("/auth/verifInscription", (req, res) => {
        let _ = req.body;
        let email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        if (
            verifMdp(_.password) !== "" ||
            _.password !== _.password2 ||
            _.pseudo.length === 0 ||
            !(email_regex.test(_.mail)) ||
            _.ddn.length !== 10
        ) {
            return res.redirect(`/auth/inscription?missed=1&pseudo=${req.body.pseudo}&mail=${req.body.mail}&ddn=${req.body.ddn}`)
        }

        bcrypt.hash(req.body.password, saltRounds, async (err, hash) =>{

            if (err){
                console.log(err)
                return res.redirect("/auth/inscription?erreur=1")
            }

            const repo = getRepository(User)
            let u = await repo.find({adresseMail: req.body.mail})
            if (u.length !== 0){
                return res.redirect(`/auth/inscription?erreur=2&pseudo=${req.body.pseudo}&mail=${req.body.mail}&ddn=${req.body.ddn}`)
            }
            let user = new User();
            user.pseudo = req.body.pseudo;
            user.password = hash;
            user.adresseMail = req.body.mail;
            user.dateDeNaissance = req.body.ddn;
            user.niveau = 1;
            user.argent = 0;
            user.nbPartiesGagnees = 0;
            user.nbPartiesJouees = 0;
            user.succes = []
            user.skins = []
            repo.save(user).then((r) => {
                console.log(JSON.stringify(r));
                return res.redirect("/auth?mail=" + user.adresseMail);
            });

        })
    })

    router.get('/auth/getPassword', (req, res) => {
        res.render("auth/getPassword", {erreur: req.query.erreur});
    });

    router.post("/auth/envoyerMail", async (req, res) => {
        let repo = getRepository(User);
        let user = await repo.find({where: {adresseMail: req.body.mail}})
        if (user.length === 0){
            return res.redirect("/auth/getPassword?erreur=1")
        }

        console.log("envoi du mail")
        await envoyerMail(req, user[0], req.body.mail, (err, info) => {
            console.log("mail envoyé ?")
            if (err)
                res.redirect("/auth/getPassword?erreur=1")
            else
                res.redirect("/auth/changePassword");
        })
    });

    router.get("/auth/changePassword", (req, res) => {
        res.render("auth/verificationCode", {wrongCode: req.query.wrongCode, wrongPassword: req.query.wrongPassword, erreur: req.query.erreur, mail: req.query.mail, code: req.query.code});
    })

    router.post("/auth/verifCode", async (req, res) => {
        let emailRepository = getRepository(RecuperationEmail);
        let code = (await emailRepository.find({where: {email: req.body.mail, code: req.body.code}}));
        if (code.length === 0) {
            return res.redirect(`/auth/changePassword?wrongCode=1&mail=${req.body.mail}&code=${req.body.code}`);
        }

        if (verifMdp(req.body.password) !== "" || req.body.password2 !== req.body.password) {
            console.log(verifMdp(req.body.password), req.body.password, req.body.password2)
            return res.redirect(`/auth/changePassword?wrongPassword=1&mail=${req.body.mail}&code=${req.body.code}`)
        }
        let userRepo = getRepository(User);

        let user = await userRepo.find({where: {adresseMail: req.body.mail}})

        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            if (err || user.length === 0)
                return res.redirect(`/auth/changePassword?erreur=1&mail=${req.body.mail}&code=${req.body.code}`)
            await emailRepository.remove(code);

            user[0].password = hash;
            await userRepo.save(user[0]);

            return res.redirect("/auth?mail=" + req.body.mail);

        });
    });

    router.post('/auth/loginRequest', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth?failed=1'
    }));
}