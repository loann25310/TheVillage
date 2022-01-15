# [The Village](https://thevillage.lagardedev.fr)
###Projet Tutoré S3-S4 2021-2022
[Github](https://github.com/loann25310/TheVillage)
## Tuteur
Jérôme HILDENBRAND

## Membres
### Chef de projet
- **Loann LAGARDE**
### Autres
- Philippe FAISANDIER
- Noé MENTION
- Thibaut MAGNIN
- Yohann MARCHAND

## Description
Projet tutoré à sujet libre, donné dans le cadre de la deuxième année de DUT.

### Notre sujet
Créer un jeu vidéo reprenant le principe du jeu rôle **Loups Garous**, en s'inspirant de la façon de jouer du jeu vidéo **Among Us**.
Ce jeu est développé pour être joué sur un navigateur web sur un PC et est susceptible d'être porté sur mobile par la suite.

## But du jeu
Un joueur appartient à un des deux camps : **Loups Garous** ou **Villageois**. Il a un rôle, avec un (ou plusieurs) pouvoir(s), à utiliser de façon à faire gagner son camp.

### Comment jouer
La partie alterne entre deux phases : la **nuit** et le **jour**.
La nuit, chaque personne a un personnage et peut se déplacer afin de réaliser des actions, espionner d'autres personnes, etc.
Le **jour**, Un chat écrit permet aux joueurs de partager leurs sentiments sur des gens, jusqu'à se décider pour tuer une personne.

### Comment gagner
Chaque **Loup Garou** peut tuer au maximum une personne par nuit, bien qu'il soit très difficile d'y arriver.
Les **Villageois** doivent débusquer les Loups Garous par exemple en les suivant la nuit et utiliser le chat écrit lors de la **journée** pour voter un loup-garou, et le tuer.

### Fin de la partie
La partie s'arrête dès qu'un des deux camps n'a plus de joueurs en vie.
(Des variantes pourront proposer des fins alternatives par la suite)

## Début du projet
**20 Septembre 2021** (20/09/2021)

## Version
**1.0.0**

## Installation

### 1. Verification des prérequis
Verifiez que vous possedez nodeJS en version 16. Entrez la commande dans un terminal :
```shell
node -v
```
Si la commande vous retourne une erreur c'est que vous ne possedez pas nodeJS passer à la section : ``Installation de NodeJS 16``.
Si la commande vous retourne une valeur du style : ``v16.x.x`` c'est que vous possedez NodeJS en version 16.
Vous pouvez donc passer à l'étape suivante.

### 3. Mise en place d'une base de donnée
Nous devons installer un SGBD. Ici nous utiliserons MySQL. Pour ce faire tapez les commandes suivantes :
```shell
sudo apt update
sudo apt install mysql-server -y
```
En suite nous devons configurer ce serveur, entrez la commande suivante :
```shell
sudo mysql_secure_installation
```
Suite au lancement de cette commande vous devrez répondre aux questions comme cela :
```
y
root
y
y
y
```
Une fois que la commande à terminer de s'exécuter tapez la commande suivant pour créer une base de données :
```shell
sudo mysql
```
Entrez le code sql suivant :
```sql
CREATE DATABASE `PTUT`;
CREATE USER 'PTUT'@'localhost' IDENTIFIED WITH mysql_native_password BY 'PTUT';
GRANT ALL PRIVILEGES ON 'PTUT'.* TO 'PTUT'@'localhost';
FLUSH PRIVILEGES;
exit;
```

### 3. Installation du projet
Dans un terminal, tapez les commandes suivantes :
```shell
git clone https://github.com/loann25310/TheVillage.git ./TheVillage
cd ./Thevillage
cp ormconfig.exemple.json ormconfig.json
cp config.example.json config.json
npm install
npm run build
sudo npm run start
```

### *(Optionnel)* Installation de NodeJS 16
```shell
sudo apt autoremove nodejs
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
rm nodesource_setup.sh
sudo apt install nodejs
node -v
```

### Quelques commandes utiles
Debug Typescript : --require ts-node/register
