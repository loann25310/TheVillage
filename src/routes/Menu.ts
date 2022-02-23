import {Router} from "express";
import {getLibs} from "../scripts/libs";
import {User} from "../entity/User";
import {getRepository} from "typeorm";
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/avatars/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + req.body.userId);
    },
    limits: {
        fileSize: 5000000
    }
});

const upload = multer({ storage });
const bcrypt = require('bcrypt');


export function Route(router: Router) {

    router.get('/', (req, res) => {
        res.render('main/menu', {user: (req.user as User)?.id});
    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

    router.get('/options', (req, res) => {
        res.render('main/options', {
            user: req.user
        });
    });
    router.get('/choice', (req, res) => {
        res.render('main/choice', {
            user: req.user
        });
    });


    router.put('/options/pseudo', async (req, res) => {
        if (/<|>| /g.test(req.body.pseudo)) {
            return res.send({
                result: "bad characters : < >",
                status: 400
            });
        }
        let user = req.user as User;
        user.pseudo = req.body.pseudo;
        await getRepository(User).save(user);
        res.send({
            result: "ok",
            status: 200
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

    router.post("/options/avatar_pic", upload.single("avatar"), async (req, res) => {
        let user = (req.user as User);
        if (user.avatar !== `avatar-${user.id}`) {
            user.avatar = `avatar-${user.id}`;
            await getRepository(User).save(user);
        }
        res.redirect("/options");
    });

    router.post("/options/avatar_col", async (req, res) => {
        let user = (req.user as User);
        user.avatar = `${req.body.avatar}`;
        await getRepository(User).save(user);
        res.redirect("/options");
    });

    router.get('/profil', (req, res) => {
        res.render('main/profil', {
            user: req.user
        });
    });

    router.get("/credits", async(req, res) => {
        let libs = getLibs();
        res.render("main/credits", {lib: JSON.stringify(libs)});
    });
}