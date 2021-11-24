import {Router} from "express";
import {getLibs} from "../scripts/libs";

export function Route(router: Router) {

    router.get('/', (req, res) => {
        res.render('main/menu', {connected: req.session["passport"]?.user});

    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

    router.get("/credits", async(req, res) => {
        let libs = await getLibs();
        res.render("main/credits", {lib: JSON.stringify(libs)})
    })
}