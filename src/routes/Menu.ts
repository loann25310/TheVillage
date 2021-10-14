import {Router} from "express";

export function Route(router: Router) {

    router.get('/', (req, res) => {
       res.send("OK");
    });


}