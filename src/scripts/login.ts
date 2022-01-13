import "../styles/authentification.css";
import {Spinner} from "../entity/Spinner";
import {data} from "jquery";

console.log($('.loader-container')[0]);

let spinner = new Spinner($('.loader-container')[0]);

$('.popup-over').hide();

$('#loginButton').click(function(e){
   let button = $('#loginButton');
   $('.popup-over').show();
   /*setTimeout(() => {
      $.post("/auth/loginRequest", {
         email: $('#email').val(),
         password: $('#password').val()
      }).done((data) => {
            window.location.replace("/");
      }).fail((jqXHR) => {
         $('.popup-over').hide();
         $('.error-container').html(`<span class="display-error">${jqXHR.responseJSON}</span>`);
      });
},  500);*/
});