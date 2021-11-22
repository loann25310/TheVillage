import * as $ from "jquery";
import {verifMdp} from "./VerifMdp";

$("#password").on("input", function (){
    let string = ""
    string = verifMdp($(this).val())
    $(this).css("boxShadow", `0 0 3px 3px ` + (string === "" ? "green" : "red"));
    $("#password_verif").text(string === "" ?  "Mot de passe fort" : string);
})

$("#password2").on("input",  function (){
    $(this).css("borderShadow", `0 0 3px 3px ` + ($("#password").val() === $(this).val() ? "green" : "red"))
})