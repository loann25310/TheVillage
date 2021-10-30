import {Router} from "express";
import {User} from "../entity/User";

export function Route(router: Router) {

    router.get('/', (req, res) => {
        res.render('main/menu');
    });

    router.get('/loading', (req, res) => {

        res.render('main/chargement');
    });

}