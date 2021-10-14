import "reflect-metadata";
import {createConnection} from "typeorm";
import logger = require("node-color-log");
import {readdirSync, readFileSync} from "fs";
import {resolve as resolvePath, extname} from "path";
import * as express from "express";
import {Express, Router} from "express";
import {Route} from "./routes/Menu";
import {Config} from "./entity/Config";

logger.info("Starting The Village");

logger.info("Loading configuration...");
const config = JSON.parse(readFileSync(resolvePath(__dirname, '../config.json'), 'utf-8')) as Config;
logger.info("Configuration loaded !");

logger.info("Connecting to database...");
createConnection().then(async connection => {
    logger.info("Connected to database !");

    logger.info("Creating Web Server...");
    const app: Express = express();
    logger.info("Web Server created !");

    logger.info("Loading routes...");
    let router = Router();
    for (const file of readdirSync(resolvePath(__dirname, 'routes/'))) {
        if(extname(file) !== '.ts') continue;
        logger.debug(` - Loading : ${file}`);
        require(resolvePath(__dirname, 'routes/', file)).Route(router);
    }
    app.use(router);
    logger.info("Routes loaded !");

    logger.info("Starting http server...");
    app.listen(config.server.port, config.server.host, () => {
        logger.info(`Http server listen on http://${config.server.host}:${config.server.port}`);
    });

}).catch(error => console.log(error));
