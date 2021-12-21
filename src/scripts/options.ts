import * as $ from 'jquery';
import Swal from "sweetalert2";
import "../styles/options.css";
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import '../entity/Tools';
import {Tools} from "../entity/Tools";
// @ts-ignore
let user = _user;
let uid = user.id;

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
    let resultEmail = await Swal.fire({
        title: 'Modifier votre adresse mail',
        input: "email",
        inputLabel: 'Adresse mail',
        inputPlaceholder: 'Nouvelle adresse mail',
        confirmButtonText: "<i class=\"fas fa-save color-blue\"></i> Sauvegarder",
        showCancelButton: true,
        cancelButtonText: "<i class=\"fas fa-times color-red\"></i> Annuler"
    });
    if (!resultEmail.isConfirmed) return;
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
    let result = await $.ajax({
        url: "/options/email",
        method: "PUT",
        data: {
            email: resultEmail.value,
            password: resultPassword.value
        }
    });

    if (result.result === "ok") {
        $("#email").text(resultEmail.value);
    }

    if (result.result === "bad") {
        await Swal.fire({
            icon: 'error',
            title: 'Bad password',
            text: 'Mot de passe incorrect !',
        })
    }
});

$("#changeavatar").on("click", async function() {
    let {value: type} = await Swal.fire({
        title: 'Selectionnez le type d\'avatar',
        input: "radio",
        inputOptions: {
            "color" : "Couleur",
            "image" : "Image"
        },
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une option'
            }
        },
        confirmButtonText: "<i class=\"fas fa-save color-blue\"></i> Valider",
        showCancelButton: true,
        cancelButtonText: "<i class=\"fas fa-times color-red\"></i> Annuler"
    });
    if (type) {
        let popup = Tools.popup();
        $(document.body).append(popup.div);
        let html = type === "image" ? `
            <form id="form_avatar" action="/options/avatar_pic" method="post" enctype="multipart/form-data">
                <input type="hidden" name="userId" value='${uid}'>
                <input id="avatar_input" type="file" accept=".png, .jpg, .jpeg, .gif" name="avatar">
                <button form="form_avatar" id="submit_avatar"><i class="fas fa-save color-blue"></i> Valider</input>
            </form>
        ` : `
            <input type="color" name="avatar">
            <button id="submit_avatar"><i class="fas fa-save color-blue"></i> Valider</button>
        `;
        popup.text.html(html);
    }
});

console.log("hey")
let avatar = $(`#avatar_pic`);
let html = "";
html += user.avatar.startsWith("#")
    ? `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=" "><div id="avatar_color" class="avatar"></div>`
    : `<img src="/avatars/${user.avatar}" width="80" alt=" ">`;
html += `</div>`
avatar.html(html);
if (user.avatar.startsWith("#"))
    $("#avatar_color").css("background-color", user.avatar);
