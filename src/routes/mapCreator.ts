import {Router} from "express";
import * as fs from "fs";
import {User} from "../entity/User";

export function Route(router: Router){
    router.get("/creator", (req, res) => {
        res.redirect("/creator/new");
    });

    router.get("/creator/:name", (req, res) => {
        let fichier;
        try {
            fichier = fs.readFileSync(`${__dirname}/../../public/maps/map_${(req.user as User).id}_${req.params.name}.json`);
        } catch (e) {}

        if (!fichier) {
            fichier = fs.readFileSync(`${__dirname}/../../public/maps/mapTemplate.json`);
        }
        res.render("map/creator", {map: fichier.toString(), name: req.params.name});
    });

    router.put('/creator/save', async (req, res) => {
        try {
            fs.writeFileSync(`${__dirname}/../../public/maps/map_${(req.user as User).id}_${req.body.nom_map}.json`, JSON.stringify(req.body));
        } catch (e) {
            console.log(e);
            return res.status(403).send({err: e});
        }
        res.status(200).send("map updated");
    });
}