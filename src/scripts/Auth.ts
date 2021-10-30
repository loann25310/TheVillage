import {User} from "../entity/User";
import {getRepository} from "typeorm";
export async function login(pseudo, password, callback){
    let userRepo = getRepository(User);
    let user = await userRepo.find({where:{Pseudo : pseudo}});

    if (user.length === 0){
        return callback(false, false);
    }
    return callback(true, user[0].Password === password);
}