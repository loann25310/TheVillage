import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import logger = require("node-color-log");
import {readdirSync, readFileSync} from "fs";
import {resolve as resolvePath, extname} from "path";
import * as express from "express";
import {Express, Router} from "express";
import {Config} from "./entity/Config";
import * as nunjucks from "nunjucks";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
const session = require("express-session");
const passport = require("passport");
import {User} from "./entity/User";
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');


logger.info("Starting The Village");

logger.info("Loading configuration...");
const config = JSON.parse(readFileSync(resolvePath(__dirname, '../config.json'), 'utf-8')) as Config;
logger.info("Configuration loaded !");

logger.info("Connecting to database...");
createConnection().then(async connection => {
    logger.info("Connected to database !");

    logger.info("Creating Web Server...");
    const app: Express = express();
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
    logger.info("Web Server created !");

    logger.info("Loading routes...");
    let router = Router();
    for (const file of readdirSync(resolvePath(__dirname, 'routes/'))) {
        if(extname(file) !== '.ts') continue;
        logger.debug(` - Loading : ${file}`);
        require(resolvePath(__dirname, 'routes/', file)).Route(router);
    }
    app.use(session({secret: "azerty"}));
    app.use(passport.initialize());
    app.use(passport.session())

    passport.use(new LocalStrategy(
        async function (username, password, done){
            let userRepo = getRepository(User);
            let user = await userRepo.find({where : {Pseudo : username}});
            if (user.length === 0){
                console.log("mauvais pseudo");
                return done(null, false, {message: "Mauvais pseudo. Veuillez réessayer ou créer un compte."});
            }
            else if (! await bcrypt.compare(password, user[0].Password)){
                bcrypt.hash("mdp", 10, function(err, hash) {
                    if (err){
                        logger.error(err.message)
                    }

                    console.log(hash)
                });
                console.log("maucais mdp")
                return done(null, false, {message: "Mauvais mot de passe. Veuillez réessayer"});
            }else
                return done(null, user[0]);
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

    app.use(router);
    logger.info("Routes loaded !");

    logger.info("Starting http server...");
    app.listen(config.server.port, config.server.host, () => {
        logger.info(`Http server listen on http://${config.server.host}:${config.server.port}`);
    });

}).catch(error => console.log(error));
