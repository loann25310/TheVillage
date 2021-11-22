import * as $ from 'jquery';
import Swal from "sweetalert2";
import "../styles/options.css";
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import {getRepository} from "typeorm";
import {User} from "../entity/User";

let email = $("#email").text();

$("#retour").click(() => {
    history.back();
});

$("#son").click(function(){
    let icon = $(this).children();
   if($(icon).hasClass("fa-volume-up")) {
       $(icon).removeClass("fa-volume-up").addClass("fa-volume-mute");
       $(icon).removeClass("color-green").addClass("color-red");
   } else {
       $(icon).removeClass("fa-volume-mute").addClass("fa-volume-up");
       $(icon).removeClass("color-red").addClass("color-green");
   }
});

$("#changepassword").click(() => {
    window.location.href = "../auth/getPassword?email="+$("#email").text();
});

$("#changeusername").click(async () => {
    let result = await Swal.fire({
       title: 'Modifier votre pseudo',
       input: "text",
       confirmButtonText: "<i class=\"fas fa-save color-blue\"></i> Sauvegarder",
       showCancelButton: true,
       cancelButtonText: "<i class=\"fas fa-times color-red\"></i> Annuler"
   });
    if(!result.isConfirmed) return;
    await $.ajax({
       url: "/options/pseudo",
       method: "PUT",
        data: {
            pseudo: result.value
        }
    });
    $("#pseudo").text(result.value);
});

$("#changeemail").click(async () => {
    let result = await Swal.fire({
        title: 'Modifier votre adresse mail',
        input: "email",
        inputLabel: 'Adresse mail',
        inputPlaceholder: 'Nouvelle adresse mail',
        confirmButtonText: "<i class=\"fas fa-save color-blue\"></i> Sauvegarder",
        showCancelButton: true,
        cancelButtonText: "<i class=\"fas fa-times color-red\"></i> Annuler"
    });
    if (!result.isConfirmed) return;
    let resultPassword = await Swal.fire({
        title: 'Entrez votre mot de passe',
        input: "password",
        inputLabel: 'Mot de passe',
        inputPlaceholder: 'Entrez votre mot de passe',
        confirmButtonText: "<i class=\"fas fa-save color-blue\"></i> Valider",
        showCancelButton: true,
        cancelButtonText: "<i class=\"fas fa-times color-red\"></i> Annuler"
    });
    if (!resultPassword.isConfirmed) return;

    else {
        // TODO: Unbroken this code. Make verification on server side
        /* let userRepo = getRepository(User);
        let user = await userRepo.find({where : {AdresseMail : email}});
        for (let i = 0; i < user.length; i++) {
            if (await bcrypt.compare(resultPassword, user[i].Password)) {
                await $.ajax({
                    url: "/options/email",
                    method: "PUT",
                    data: {
                        email: result.value
                    }
                });
                $("#email").text(result.value);
            }
        } */
    }
})