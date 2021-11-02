import {Router} from "express";

export function Route(router: Router) {

    router.get('/', (req, res) => {
        console.log(req.session)
        res.render('main/menu', {connected: req.session["passport"]?.user});

    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

}