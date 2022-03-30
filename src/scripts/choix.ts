import "../styles/choix.css"
import * as $ from "jquery"
import {io} from "socket.io-client";

const join = $("#join")
const popup = $("#popup")
const joinbt = $("#popup.bt")
const btCode = $("#btCode");
const formCode = $("#formCode");
let inputCode = $("#inputCode").val();
const validate = $("#validate");

join.on("click", function() {
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

btCode.on("click", function (){
    btCode.css({
        'display':'none',
    });
    formCode.css({
        'display':'block',
    });
});

validate.on("click",function (){
    inputCode = $("#inputCode").val();
    formCode.attr('action',`/lobby/${inputCode}`);
});