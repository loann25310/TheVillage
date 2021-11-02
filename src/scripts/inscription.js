let password = document.getElementById("password");
let password2 = document.getElementById("password2");

password2.style.borderStyle = "inset";
password.style.borderStyle = "inset";

let password1_valid = false
let password2_valid = false

let email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

password.oninput = function (){
    let string = ""
    password.style.boxShadow = "0 0 3px 3px green"
    let erreurs = []

    if (!(/^(.*[a-z].*)$/g.test(password.value)))
        erreurs.push("une lettre minuscule");

    if (!(/^(.*[A-Z].*)$/g.test(password.value)))
        erreurs.push("une lettre majuscule");

    if (!(/^(.*[!@#$&*+°()=-].*)$/g.test(password.value)))
        erreurs.push("un caratère spécial ( ! @ # $ & * + ° ( ) = - )");

    if (!(/^(.*[0-9].*)$/g.test(password.value)))
        erreurs.push("un chiffre");

    if (!(/^(.{8,})$/.test(password.value)))
        erreurs.push("8 caractères")

    if (erreurs.length !== 0) {
        password1_valid = false
        password.style.boxShadow = "0 0 3px 3px red"
        string = "Votre mot de passe doit contenir au minimum : " + erreurs[0]

        for (let i = 1; i < erreurs.length - 1; i++) {
            string += ", " + erreurs[i];
        }
        if (erreurs.length > 1)
        string += " et " + erreurs[erreurs.length-1]
    }else password1_valid = true
    document.getElementById("password_verif").innerText = string === "" ?  "Mot de passe fort" : string

    password2.style.boxShadow = (password.value === password2.value) ? "0 0 3px 3px green" : "0 0 3px 3px red";

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

document.oninput = function () {

    document.getElementById("valider")?.remove()

    if (
        document.getElementById("pseudo").value.length > 0 &&
        document.getElementById("prenom").value.length > 0 &&
        document.getElementById("nom").value.length > 0 &&
        email_regex.test(document.getElementById("email").value) &&
        document.getElementById("ddn").value.length === 10 &&
        password1_valid &&
        password2_valid
    ) {
        let valider = document.createElement("input")
        valider.type = "submit"
        valider.id = "valider"
        document.getElementById("form").appendChild(valider)
    }
}

//     ouiOUI1*