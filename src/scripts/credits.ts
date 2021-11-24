import "../styles/credits.css";
import * as $ from "jquery";

let index = 0,
    index_2 = 0,
    wait = 0,
    lib = JSON.parse($("#lib").text())

const display = [
    {
        titre: "THE VILLAGE, don't trust anyone",
        values: [""]
    },{
        titre: "Projet tutoré 2021 - 2022",
        values: [""]
    }, {
        titre: "Tuteur",
        values: ["Jérôme Hildenbrand"]
    }, {
        titre:  "Chef de projet",
        values: [
            'Loann Lagarde'
        ]
    }, {
        titre: "Membres du projet",
        values: [
            "Philippe Faisandier",
            "Thibaut Magnin",
            "Yohann Marchand",
            "Noé Mention"
        ]
    }, {
        titre: "Graphismes",
        values: ["Yohann Marchand"]
    }, {
        titre: "Développeurs",
        values: [
            "Philippe Faisandier",
            'Loann Lagarde',
            "Thibaut Magnin",
            "Yohann Marchand",
            "Noé Mention"
        ]
    }, lib
]
write();

function write(){
    setInterval(getNext, 300);
}

function getNext(){
    if (wait > 0){
        wait --
        return;
    }
    if (index === 0 && index_2 === 0){
        titre(display[index].titre)
        index_2 ++
        wait = 6
    } else if (display[index].values.length > index_2) {
        texte(display[index].values[index_2])
        index_2++;
        if (index_2 >= display[index].values.length)
            wait = 3
    } else if (display.length > index + 1){
        wait = 2
        index_2 = 0;
        index ++
        titre(display[index].titre)
    } else {
        index = 0;
        index_2 = 0;
        wait = 20
    }
}

function titre(string :string){
    let h1 = $("<h1>", {
        class: "up",
    }).text(string).appendTo("#container")
    setTimeout(() => {
        h1.remove();
    }, 7000)
}

function texte(string :string){
    let div = $("<div>", {
        class: "up",
    }).html(string).appendTo("#container")
    setTimeout(() => {
        div.remove();
    }, 8000)
}