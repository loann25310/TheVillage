import "../styles/inscription.css";
import {Spinner} from "../entity/Spinner";
import {verifMdp} from "./VerifMdp";
import {Tools} from "../entity/Tools";

new Spinner($('.loader-container')[0]);

$('.popup-over').hide();

$('#inscription').on('click', function(e){
    $('.popup-over').show();
});

const errorContainer = $("#error-container");
const displayError = $("#display-error");
const password = $("#password");
const password2 = $("#password2");
const pseudo = $("#pseudo");

const errors = {
    pseudo: "",
    mail: "",
    mdp1: "",
    mdp2: ""
};


errorContainer.css("visibility", displayError.text().replace(/ |\n/g, "").length === 0 ? "hidden" : "visible");

password.on('input', () => {
    errors.mdp1 = verifMdp(password.val());
    update_err();
});

password2.on('input', () => {
    errors.mdp2 = (password.val() === password2.val() ? "" : "Les mots de passe ne correspondent pas.");
    update_err();
});

pseudo.on("input", () => {
    errors.pseudo = !Tools.regex_pseudo.test(pseudo.val() as string) ? "Vérifiez que votre pseudo ne contienne pas de caractères spéciaux autres que - et _" : "";
    update_err();
});

function update_err() {
    displayError.text(
        errors.pseudo.length === 0 ?
            (errors.mail.length === 0 ?
                (errors.mdp1.length === 0 ?
                    (errors.mdp2.length === 0 ? "" : errors.mdp2)
                : errors.mdp1)
            : errors.mail)
        : errors.pseudo
    );
    errorContainer.css("visibility", displayError.text().replace(/ |\n/g, "").length === 0 ? "hidden" : "visible");
}