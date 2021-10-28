import "../styles/chargement.css";

$(document).ready(function () {
    $("html").hide().fadeIn(1000);
    $("body").hide().fadeIn(1500);


});

$(function () {
    let progressbar = $("#progressbar")
    progressbar.progressbar({});
    let points = 0;

    function progress() {
        let val = progressbar.progressbar("value") || 0;

        if(val % 5 === 0){
            points++;
            if(points <= 3)
                $('.points').text($('.points').text() + ".");
            else{
                points = 0;
                $('.points').text("");
            }
        }


        progressbar.progressbar("value", val+1);

        if (val < 99) {
            setTimeout(progress, 50);
        }
    }
    setTimeout(progress, 500);
});