export function verifMdp(password) :string{
    let erreurs = [], string = ""

    if (!(/^(.*[a-z].*)$/g.test(password)))
        erreurs.push("une lettre minuscule");

    if (!(/^(.*[A-Z].*)$/g.test(password)))
        erreurs.push("une lettre majuscule");

    if (!(/^(.*[!@#$&*+°()=-].*)$/g.test(password)))
        erreurs.push("un caratère spécial ( ! @ # $ & * + ° ( ) = - )");

    if (!(/^(.*[0-9].*)$/g.test(password)))
        erreurs.push("un chiffre")

    if (!(/^(.{8,})$/.test(password)))
        erreurs.push("8 caractères")

    if (erreurs.length !== 0) {
        string = "Votre mot de passe doit contenir au minimum : " + erreurs[0]

        for (let i = 1; i < erreurs.length - 1; i++) {
            string += ", " + erreurs[i];
        }
        if (erreurs.length > 1)
            string += " et " + erreurs[erreurs.length-1]
    }
    return string
}