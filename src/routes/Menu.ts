import {Router} from "express";

export function Route(router: Router) {

    router.get('/', (req, res) => {

        console.log(req.session)
        if (!(req.session["passport"]) || Object.keys(req.session["passport"]).length === 0){
            return res.redirect('/auth');
        }else {
            console.log(req.session["passport"])
            res.render('main/menu');
        }
    });

    router.get('/loading', (req, res) => {
        res.render('main/chargement');
    });

}