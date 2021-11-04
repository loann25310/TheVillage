import {verifMdp} from "./VerifMdp";

let password = document.getElementById("password");
let password2 = document.getElementById("password2");

password2.style.borderStyle = "inset";
password.style.borderStyle = "inset";

let password1_valid = false
let password2_valid = false

password.oninput = function (){
    let string = ""
    string = verifMdp(password.value)
    password.style.boxShadow = `0 0 3px 3px ` + (string === "" ? "green" : "red");
    password1_valid = string === ""
    document.getElementById("password_verif").innerText = string === "" ?  "Mot de passe fort" : string
}

password2.oninput = function (){
    if (password.value === password2.value){
        password2.style.boxShadow =  "0 0 3px 3px green"
        password2_valid = true
    }
    else{
        password2.style.boxShadow = "0 0 3px 3px red";
        password2_valid = false
    }

}