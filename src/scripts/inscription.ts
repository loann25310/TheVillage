import * as $ from "jquery";
import {verifMdp} from "./VerifMdp";

let password = $("#password")
let password2 = $("#password2");

password.on("input", function (){
    let string = ""
    string = verifMdp(password.val())
    password.css("boxShadow", `0 0 3px 3px ` + (string === "" ? "green" : "red"));
    document.getElementById("password_verif").innerText = string === "" ?  "Mot de passe fort" : string
})

password2.on("input",  function (){
    password2.css("borderShadow", `0 0 3px 3px ` + (password.val() === password2.val() ? "green" : "red"))
})