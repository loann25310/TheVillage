import {Router} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/User";
import * as console from "console";
import {RecuperationEmail} from "../entity/RecuperationEmail";
const passport = require("passport");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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
            let u = await repo.find({adresseMail: req.body.mail})
            if (u.length !== 0){
                return res.redirect(`/auth/inscription?erreur=2&pseudo=${req.body.pseudo}&prenom=${req.body.prenom}&nom=${req.body.nom}&mail=${req.body.mail}&ddn=${req.body.ddn}`)
            }
            let user = new User();
            user.pseudo = req.body.pseudo;
            user.password = hash;
            user.nom = req.body.nom;
            user.prenom = req.body.prenom;
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
            return res.redirect("/auth/getPassword?erreur = 1")
        }

        function get_code() {
            let code: string = "";
            for (let i = 0; i < 6; i++) {
                code += ("" + Math.random() * 10)
            }
            return code;
        }

        const code_repo = getRepository(RecuperationEmail)
        let code = get_code();
        while ((await code_repo.find({where: {code: code}})).length !== 0){
            code = get_code();
            console.log("new code needed")
        }

        let c = new RecuperationEmail();
        c.code = code;
        c.email = req.body.mail;
        await code_repo.save(c);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "the.village.dont.trust.anyone@gmail.com",
                pass: "theVillage1*"
            }
        })

        const mailOptions = {
            from: "the.village.dont.trust.anyone@gmail.com",
            to: req.body.mail,
            subject: "Récupération de mot de passe",
            text: "voici le code nécessaire à la récupération de votre mot de passe : " + code
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err){
                console.log(err)
                res.redirect("/auth/getPassword")
            }
            else if (info) {
                console.log(`Email sent to ${req.body.mail} : ${info.response}`);
                return res.redirect("/auth/")
            }
        })
    })



    router.post('/auth/loginRequest', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth?failed=1'
    }));
}