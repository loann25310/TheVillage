import * as $ from 'jquery';
import "../styles/profil.css";
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import {Chart, ChartItem, registerables} from 'chart.js';
Chart.register(...registerables);

let canvas = <HTMLCanvasElement> $("#winrateChart").get(0);
let wrc = canvas.getContext('2d');

let partiesJouees = $('#nbParties');
let victoires = $('#nbVictoires').text();
let defaites = +partiesJouees.text() - +victoires;

if (+partiesJouees.text()=== 0) {
    partiesJouees.text("Aucune partie jouée");
    partiesJouees.removeClass("hidden");
}

new Chart(wrc, {
    type: 'doughnut',
    data: {
        labels: ['Victoires','Défaites'],
        datasets: [{
            label: 'Victoires/Défaites',
            data: [victoires, defaites],
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
        }]
    },
});

$("#retour").click(() => {
    history.back();
});