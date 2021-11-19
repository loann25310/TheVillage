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
        values: ["Jérôme HILDENBRAND"]
    }, {
        titre:  "Chef de projet",
        values: [
            'Loann LAGARDE'
        ]
    }, {
        titre: "Membres du projet",
        values: [
            "Philippe FAISANDIER",
            "Thibaut MAGNIN",
            "Yohann MARCHAND",
            "Noé MENTION"
        ]
    }, {
        titre: "Graphismes",
        values: ["Yohann MARCHAND"]
    }, {
        titre: "Développeurs",
        values: [
            "Philippe FAISANDIER",
            'Loann LAGARDE',
            "Thibaut MAGNIN",
            "Yohann MARCHAND",
            "Noé MENTION"
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
        wait = 3
    } else if (display[index].values.length > index_2) {
        texte(display[index].values[index_2])
        index_2++;
        if (index_2 >= display[index].values.length)
            wait = 1
    } else if (display.length > index + 1){
        wait = 1
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
    }, 10000)
}

function texte(string :string){
    let div = $("<div>", {
        class: "up",
    }).html(string).appendTo("#container")
    setTimeout(() => {
        div.remove();
    }, 10000)
}