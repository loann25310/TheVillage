import * as fs from "fs";

const libs = require(`../../package.json`).dependencies
const libs2 = require(`../../package.json`).devDependencies

export function getLibs(){
    let l = {
        titre: "Librairies utilisées",
        values: []
    }

    for (const lib in libs){
        try {
            let file = fs.readFileSync(`${__dirname}/../../node_modules/${lib}/LICENSE`, {
                encoding: 'utf-8',
                flag: 'r'
            }).replace(/\r/g, "").replace("  ", "");
            let license = file ? file.split("\n")[0] : ""
            l.values.push(`${lib} : <small>${license}</small>`)
        }catch (e){
            l.values.push(`${lib}`)
        }
    }
    for (const lib in libs2){
        try {
            let file = fs.readFileSync(`${__dirname}/../../node_modules/${lib}/LICENSE`, {
                encoding: 'utf-8',
                flag: 'r'
            });
            let license = file ? file.split("\n")[0] : ""
            l.values.push(`${lib} : <small>${license}</small>`)
        }catch (e){
            l.values.push(`${lib}`)
        }

    }
    return l;
}