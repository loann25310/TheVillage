import * as $ from "jquery";
import {verifMdp} from "./VerifMdp";

let password = $("#password");
let password2 = $("#password2");

password.on("input", verif)

password2.on("input", verif)

function verif(){
    let string = verifMdp(password.val())
    $("#password_info").text((string === "" ? "Mot de passe fort" : verifMdp(password.val())))
    password.css("box-shadow", `0 0 3px 3px ` + (string === "" ? "green" : "red"))
    password2.css("box-shadow", `0 0 3px 3px ` + (password.val() === password2.val() ? "green" : "red"))
}
