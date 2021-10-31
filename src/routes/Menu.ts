import {Router} from "express";

export function Route(router: Router) {

    router.get('/', (req, res) => {

        if (!req.session["passport"]){
            return res.redirect('/auth');
        }else {
            res.render('main/menu');
        }
    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

}