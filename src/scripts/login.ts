import "../styles/authentification.css";
import {Spinner} from "../entity/Spinner";

new Spinner($('.loader-container')[0]);

$('.popup-over').hide();

$('#loginButton').on("click", function(){
   $('.popup-over').show();
});