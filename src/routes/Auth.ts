import {Router} from "express";
const passport = require("passport");
import {login} from "../scripts/Auth";

export function Route(router: Router) {

    router.get('/auth', (req, res) => {
        console.log(req.query)
        res.render('auth/login', {data: req.query.result});
    });

    router.post('/auth/loginRequest', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth',
    }));

}