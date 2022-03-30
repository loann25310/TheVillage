import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import {readdirSync, readFileSync} from "fs";
import {extname, resolve as resolvePath} from "path";
import * as express from "express";
import {Express, Router} from "express";
import {Config} from "./entity/Config";
import * as nunjucks from "nunjucks";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import { createServer as createServerHttp } from "http";
import { createServer as createServerHttps } from "https";
import {Server} from "socket.io";
import {User} from "./entity/User";
import logger = require("node-color-log");
import * as session from "express-session";
// import { Strategy as RememberMeStrategy } from "passport-remember-me";
import {RememberMeToken} from "./entity/RememberMeToken";

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const RememberMeStrategy = require("passport-remember-me").Strategy;
const bcrypt = require('bcrypt');

/**
 * Pour autoriser une route sans être authentifié :
 * ajouter le nom de la route toute seule
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
Config.CONFIGURATION = config;
logger.info("Configuration loaded !");

logger.info("Connecting to database...");
createConnection().then(async connection => {
    logger.info("Connected to database !");

    logger.info("Creating Web Server...");
    const app: Express = express();
    let httpServer;
    if(config.server.useSSL){
        const key = readFileSync(config.server.ssl_key_path);
        const cert = readFileSync(config.server.ssl_cert_path);
        httpServer = createServerHttps({key, cert}, app);
    }else{
        httpServer = createServerHttp(app);
    }

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
    app.use(bodyParser.urlencoded({ extended: true, limit:"5mb" }));

    //@ts-ignore
    //const httpServerIO = createServer({
    //    key: readFileSync("/etc/letsencrypt/live/thevillage.lagardedev.fr/privkey.pem"),
    //    cert: readFileSync("/etc/letsencrypt/live/thevillage.lagardedev.fr/fullchain.pem")
    //});
    //@ts-ignore
    const io = new Server(httpServer);
    // const io = new Server(httpServer);
    logger.info("Web Server created !");

    logger.info("Loading routes...");
    let router = Router();

    const sessionMiddleware = session({ secret: "azerty", resave: false, saveUninitialized: false });
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));
    app.use(async (req, res, next) => {
        if(req.user){
            let user = req.user as User;
            user.password = undefined;
            res.locals.currentUser = user;
        }else{
            res.locals.currentUser = null;
        }
        res.locals.currentRoute = req.path;
        next();
    });

    app.use((req, res, next) => {
        if (!req.user){
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

    app.use((req, res) => {
        res.render("main/page404");
    });

    passport.use(new RememberMeStrategy(
        async function(token, done){
            let rememberToken = await getRepository(RememberMeToken).findOne({
                where: {
                    token: token
                },
                relations: ['user']
            });
            if (!rememberToken) return done(null, false);
            return done(null, rememberToken.user);
        },
        async function(user, done){
            if(!user) return done(null, false);
            let token = new RememberMeToken();
            token.generateDefaultToken(user);
            await getRepository(RememberMeToken).save(token);
            return done(null, token.token);
        }
    ));

    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        async function (email, password, done){
            let userRepo = getRepository(User);
            let user = await userRepo.findOne({where : {adresseMail : email}});
            if(!user) return done(null, false);

            if (!(await bcrypt.compare(password, user.password)))
                return done(null, false);

            return done(null, user);
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(async function(id, done) {
        let userRepo = getRepository(User);
        let user = await userRepo.findOne(id);
        return user === undefined ? done("User is undefined", null) : done(null, user);
    });

    for (const file of readdirSync(resolvePath(__dirname, 'routes/'))) {
        if(extname(file) !== ((config.env === 'debug')?'.ts':'.js')) continue;
        logger.debug(` - Loading : ${file}`);
        require(resolvePath(__dirname, 'routes/', file)).Route(router, io, sessionMiddleware);
    }

    logger.info("Routes loaded !");


    logger.info("Starting http server...");
    httpServer.listen(config.server.port, config.server.host, () => {
        logger.info(`Http server listen on http://${config.server.host}:${config.server.port}`);
    });

}).catch(error => console.log(error));
