import {Entity, Column, PrimaryColumn, ManyToOne, getRepository} from "typeorm";
import {User} from "./User";
import {v4 as uuidv4} from "uuid";

@Entity()
export class RememberMeToken {

    static readonly maxAgeToken = 604800000; // 7 days

    @PrimaryColumn({ length: 255 })
    token: string;

    @ManyToOne(() => User)
    user: User;

    @Column()
    expire: Date;

    generateDefaultToken(user: User){
        this.token = uuidv4();
        this.user = user;
        this.expire = new Date(Date.now() + RememberMeToken.maxAgeToken);
    }

    static async saveToken(req, res, user){
        let token;

        if(!req.cookies.remember_me){
            token = new RememberMeToken();
            token.generateDefaultToken(user);
        }else{
            token = await getRepository(RememberMeToken).findOne({
                user: user
            });
            if(!token || token.expire <= new Date()){
                token = new RememberMeToken();
                token.generateDefaultToken(user);
            }else{
                token.expire = new Date(Date.now() + RememberMeToken.maxAgeToken);
            }
        }
        await getRepository(RememberMeToken).save(token);
        res.cookie('remember_me', token.token, { path: '/', httpOnly: true, maxAge: RememberMeToken.maxAgeToken });
    }

    static async removeToken(req, res){
        if(!req.cookies.remember_me) return;
        let token = await getRepository(RememberMeToken).findOne({
            user: req.user
        });
        if(token)
            await getRepository(RememberMeToken).remove(token);
        res.cookie('remember_me', "null", { path: '/', httpOnly: true, maxAge: -RememberMeToken.maxAgeToken });
    }
}