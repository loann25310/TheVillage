import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {RecuperationEmail} from "../entity/RecuperationEmail";
import * as nunjucks from "nunjucks";
const nodemailer = require("nodemailer")

export function Route(){}


export async function envoyerMail(req, user :User, mail: string, callback){
    async function get_code() {
        let code: string = "";
        for (let i = 0; i < 6; i++) {
            code += ("" + Math.floor(Math.random() * 10))
        }
        if ((await code_repo.find({where: {code: code}})).length !== 0){
            return get_code();
        }
        else
            return code;
    }

    const code_repo = getRepository(RecuperationEmail)
    let code = await get_code();

    await code_repo.delete({email: mail})

    let c = new RecuperationEmail();
    c.code = code;
    c.email = mail
    await code_repo.save(c);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "the.village.dont.trust.anyone@gmail.com",
            pass: "theVillage1*"
        }
    });


    const html = nunjucks.render(
        "auth/mailTemplate.twig", {
            code,
            lien: `${req.protocol + '://' + req.get('host')}/auth/changePassword?mail=${mail}&code=${code}`
        }
    );

    const mailOptions = {
        from: "the.village.dont.trust.anyone@gmail.com",
        to: mail,
        subject: `Réinitialisation de mot de passe [${code}]`,
        text: `Voici le code nécessaire à la récupération de votre mot de passe : ${code}.\n Connectez vous via ce lien : ${req.protocol + '://' + req.get('host')}/auth/changePassword?mail=${mail}&code=${code}`,
        html
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err){
            console.log(err)
            callback(err);
        }
        else if (info) {
            console.log(`Email sent to ${mail} : ${info.response}`);
            callback(null, info);
        }
    });
}