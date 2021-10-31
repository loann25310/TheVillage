import {Router} from "express";
const passport = require("passport");

export function Route(router: Router) {

    router.get('/auth', (req, res) => {
        if (req.session['passport']){
            return res.redirect('/');
        }
        res.render('auth/login', {failed: req.query.failed});
    });

    router.post('/auth/loginRequest', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth?failed=1'
    }));
}