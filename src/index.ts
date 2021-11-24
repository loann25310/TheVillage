import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import logger = require("node-color-log");
import {readdirSync, readFileSync} from "fs";
import {resolve as resolvePath, extname} from "path";
import * as express from "express";
import {Express, Router} from "express";
import {Route} from "./routes/Menu";
import {Config} from "./entity/Config";
import * as nunjucks from "nunjucks";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as http from "http";
import { Server } from "socket.io";
const session = require("express-session");
const passport = require("passport");
import {User} from "./entity/User";
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
//pour hash le mdp
const saltRounds = 10;

/**
 * Pour autoriser une route sans être authentifié :
 * ajouter le nom de la route toute seule ,
 * ou ajouter le nom de la route avec ` *` à la fin pour autoriser **TOUTES** les routes commençant par ça. (exemple : `/auth *`)
 *
 * __Rappel__ :
 * Si vous devez passer par une route post pour traiter une requête et rediriger l'utilisateur, il faut **aussi** l'autoriser à accéder à cette route
 */
let urlWithoutAuth :string[] = [
    "/",
    "/auth *",
    "/credits *"
];

logger.info("Starting The Village");

logger.info("Loading configuration...");
const config = JSON.parse(readFileSync(resolvePath(__dirname, '../config.json'), 'utf-8')) as Config;
logger.info("Configuration loaded !");

logger.info("Connecting to database...");
createConnection().then(async connection => {
    logger.info("Connected to database !");

    logger.info("Creating Web Server...");
    const app: Express = express();
    const httpServer = http.createServer(app);
    app.use(express.json());
    app.use(express.static(__dirname + '/../public'));
    const env = nunjucks.configure(__dirname + '/templates/', {
        autoescape: false,
        express: app,
        watch: (config.env === 'debug')
    });
    app.set('views', __dirname + '/templates');
    app.set('view engine', 'twig');
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    const io = new Server(httpServer);
    logger.info("Web Server created !");

    logger.info("Loading routes...");
    let router = Router();
    for (const file of readdirSync(resolvePath(__dirname, 'routes/'))) {
        if(extname(file) !== '.ts') continue;
        logger.debug(` - Loading : ${file}`);
        require(resolvePath(__dirname, 'routes/', file)).Route(router, io);
    }
    app.use(session({
        secret: "azerty",
        resave: false,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session())

    app.use((req, res, next) => {
        if (!req.session["passport"]?.user){
        for (let i = 0; i < urlWithoutAuth.length; i++) {
            if (urlWithoutAuth[i].split(" ").length === 1) {
                if (req["_parsedOriginalUrl"].pathname === urlWithoutAuth[i]) {
                    return next();
                }
            }
            if (urlWithoutAuth[i].split(" ")[1] === "*") {
                if (req["_parsedOriginalUrl"].pathname.startsWith(urlWithoutAuth[i].split(" ")[0])) {
                    return next();
                }
            }
        }
        res.redirect("/auth")
    }
        else next();
    })

    app.use(router);

    passport.use(new LocalStrategy({
            usernameField: 'mail'
        },
        async function (mail, password, done){
            let userRepo = getRepository(User);
            let user = await userRepo.find({where : {adresseMail : mail}});
            for (let i = 0; i < user.length; i++){
                if (await bcrypt.compare(password, user[i].password))
                    return done(null, user[i])
            }
            return done(null, false);

        }
    ))
    passport.serializeUser(function(user, done) {
        done(null, user.id);

    });
    passport.deserializeUser(async function(id, done) {
        let userRepo = getRepository(User);
        let user = await userRepo.findOne(id);
        return user === undefined ? done("User is undefined") : done(null, user);

    });
    logger.info("Routes loaded !");


    logger.info("Starting http server...");
    httpServer.listen(config.server.port, config.server.host, () => {
        logger.info(`Http server listen on http://${config.server.host}:${config.server.port}`);
    });

}).catch(error => console.log(error));
