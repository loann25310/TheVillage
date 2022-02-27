import {Router} from "express";
import * as fs from "fs";

export function Route(router: Router){
    router.get("/creator", (req, res) => {
        res.redirect("/creator/new");
    });

    router.get("/creator/:name", (req, res) => {
        let name = req.params.name;
        let fichier;
        if (name !== "new") {
            if (!name.endsWith(".json")) name += ".json";
            try {
                fichier = fs.readFileSync(`${__dirname}/../../public/maps/${name}`);
            } catch (e) {}
        }
        if (!fichier) {
            fichier = fs.readFileSync(`${__dirname}/../../public/maps/mapTemplate.json`);
        }
        res.render("map/creator", {map: fichier.toString(), name: JSON.parse(fichier.toString()).nom_map});
    });

    router.put('/creator/save', (req, res) => {
        try {
            fs.writeFileSync(`${__dirname}/../../public/maps/${req.body.nom_map}.json`, JSON.stringify(req.body));
        } catch (e) {
            console.log(e);
            return res.status(500).send({err: e});
        }
        res.status(200).send("map updated");
    });
}