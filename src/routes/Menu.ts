import {Router} from "express";
import {User} from "../entity/User";

export function Route(router: Router) {

    router.get('/', (req, res) => {

        let u = new User();
        u.Nom = "";

       res.render('main/menu', {
           variable: 'Test 123 789'
       });
    });

    router.get('/loading', (req, res) => {

        res.render('main/chargement');
    });


}