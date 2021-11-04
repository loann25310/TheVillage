import {getRepository} from "typeorm";
import {User} from "../entity/User";
import {RecuperationEmail} from "../entity/RecuperationEmail";
const nodemailer = require("nodemailer")

export async function envoyerMail(user :User, mail: string, callback){
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
    })

    const mailOptions = {
        from: "the.village.dont.trust.anyone@gmail.com",
        to: mail,
        subject: "Récupération de mot de passe",
        text: "voici le code nécessaire à la récupération de votre mot de passe : " + code
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
    })
}