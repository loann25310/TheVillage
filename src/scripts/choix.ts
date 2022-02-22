import "../styles/choix.css"
import * as $ from "jquery"
import {io} from "socket.io-client";
const socket = io();
import {Partie} from "../entity/Partie";

const join = $("#join")
const popup = $("#popup")
const joinbt = $("#popup.bt")
const btCode = $("#btCode");
const formCode = $("#formCode");
let inputCode = $("#inputCode").val();

const validate = $("#validate");




join.click(function() {
    popup.css({
        'display': 'grid',
        'color': 'white',
        'font-size': '10px',
        'height': '60%'
    });
    join.css({
        'display':'none'
    });
    joinbt.css({
        'height':'20%',
    });


});
btCode.click(function (){
    btCode.css({
        'display':'none',
    });
    formCode.css({
        'display':'block',
    })



});
validate.click(function (){
    inputCode = $("#inputCode").val();
    formCode.attr('action',`/lobby/${inputCode}`);
})




